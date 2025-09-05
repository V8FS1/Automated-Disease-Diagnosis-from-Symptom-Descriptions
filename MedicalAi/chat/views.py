from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, action, authentication_classes
from rest_framework.authentication import TokenAuthentication
from transformers import pipeline
import os
import json
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

from .models import Conversation, Message
from .utils import load_disease_data
from .serializers import ConversationDetailSerializer


# 🟢 Register
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=400)
        user = User.objects.create_user(username=username, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})


# 🟢 Login
@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    authentication_classes = []  # allow unauthenticated access
    permission_classes = []  # allow unauthenticated access

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key})
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


# 🟢 Logout
class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Simply delete the token to force a login
            request.user.auth_token.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🟢 Create a conversation
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


from django.utils.timezone import now

from rest_framework import viewsets, permissions
from .models import Conversation
from .serializers import ConversationSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all().prefetch_related("messages")
    serializer_class = ConversationSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=['post', 'delete'])
    def delete_all(self, request):
        """Delete all conversations for the authenticated user."""
        try:
            # Delete all conversations and their messages for the current user
            conversations = self.get_queryset()
            count = conversations.count()
            conversations.delete()
            
            return Response(
                {'status': 'success', 'message': f'Successfully deleted {count} conversations.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# 🟢 Predict
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TextClassificationPipeline,
)
import os

from .models import Conversation, Message
from .utils import load_disease_data
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers.pipelines import TextClassificationPipeline
import torch

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TextClassificationPipeline,
)
import torch

from transformers import (
    AutoConfig,
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TextClassificationPipeline,
)
import os


@method_decorator(csrf_exempt, name="dispatch")
class PredictView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Get data from request with fallbacks
            data = request.data
            if isinstance(data, str):
                
                try:
                    data = json.loads(data)
                except json.JSONDecodeError:
                    return Response({
                        'status': 'error',
                        'message': 'Invalid JSON data in request'
                    }, status=400)
            
            message = data.get("message") or data.get("symptoms", "")
            conv_id = data.get("conversation_id")
            user = request.user if request.user.is_authenticated else None
            print("📥 Raw request data:", data)
            print("💬 Extracted message:", message)
            print("🧾 Conversation ID received:", conv_id)
            print("👤 Authenticated user:", user)
            print("🔍 Current conversation state - conv_id type:", type(conv_id), "value:", conv_id)
            
            # Convert conversation ID to integer if it's a string
            if conv_id and isinstance(conv_id, str):
                try:
                    conv_id = int(conv_id)
                    print(f"🔄 Converted conversation ID from string to int: {conv_id}")
                except ValueError:
                    print(f"❌ Invalid conversation ID format: {conv_id}")
                    conv_id = None
            
            if not message:
                return Response({
                    'status': 'error',
                    'message': 'No message or symptoms provided'
                }, status=400)

            # Handle conversation
            conversation = None
            is_new_conversation = False
            title = (message[:50] + '...') if len(message) > 50 else message

            if user:
                try:
                    if not conv_id:
                        print("🆕 Creating new conversation - no conv_id provided")
                        conversation = Conversation.objects.create(user=user, title=title)
                        conv_id = conversation.id
                        is_new_conversation = True
                        print(f"✅ Created new conversation with ID: {conv_id}")
                    else:
                        print(f"🔄 Using existing conversation ID: {conv_id}")
                        conversation = Conversation.objects.get(id=conv_id, user=user)
                        print(f"✅ Found existing conversation: {conversation.id}")
                except Exception as e:
                    print(f"❌ Error handling conversation: {str(e)}")
                    # Continue without conversation handling if there's an error

            try:
                # Load model and make prediction
                model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../model"))
                if not os.path.isdir(model_path) or not os.path.exists(os.path.join(model_path, "config.json")):
                    print(f"Model not found at path: {model_path}")
                    # Fall back to simple keyword matching if model is not available
                    raise Exception("Model not found, using fallback matching")
                
                # Load model and tokenizer
                tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
                config = AutoConfig.from_pretrained(model_path, local_files_only=True)
                model = AutoModelForSequenceClassification.from_pretrained(
                    model_path, config=config, local_files_only=True
                )
                classifier = TextClassificationPipeline(
                    model=model, 
                    tokenizer=tokenizer, 
                    return_all_scores=True, 
                    top_k=3, 
                    device=-1
                )
                
                # Make prediction
                result = classifier(message)
                
                # Match with disease data
                diseases = load_disease_data()
                matched = []
                for disease_scores in result:
                    for r in disease_scores:
                        name = r["label"]
                        match = next((d for d in diseases if d.get("name", "").lower() == name.lower()), None)
                        if match:
                            match["confidence"] = round(r["score"] * 100, 2)
                            matched.append(match)
                
                # Format response
                if matched:
                    # The main JS logic expects an array of predictions
                    response_data = {
                        'status': 'success',
                        'data': {
                            'predictions': matched,  # Pass the list of matched diseases
                            'conversation_id': str(conv_id) if conv_id else None
                        },
                        'conversation_id': str(conv_id) if conv_id else None,
                        'is_new_conversation': is_new_conversation
                    }
                else:
                    response_data = {
                        'status': 'not_found',
                        'message': 'No matching conditions found. Please provide more details about your symptoms.',
                        'conversation_id': str(conv_id) if conv_id else None,
                        'is_new_conversation': is_new_conversation
                    }
                
                # Save messages if we have a conversation
                if conversation:
                    print("🟢 Saving user and AI messages to conversation:", conversation.id)
                    try:
                        # Create user message
                        user_msg = Message.objects.create(conversation=conversation, is_user=True, text=message)
                        print("✅ Saved user message:", user_msg.text)

                        # Create AI message
                        ai_message_text = json.dumps(response_data['data']) if 'data' in response_data else response_data.get('message', '')
                        ai_msg = Message.objects.create(
                            conversation=conversation, 
                            is_user=False, 
                            text=ai_message_text
                        )
                        print("✅ Saved AI message:", ai_msg.text)

                    except Exception as e:
                        print(f"Error saving messages: {str(e)}")
                print("User:", user)
                print("Conversation ID:", conversation.id if conversation else None)
                print("Messages count:", conversation.messages.count() if conversation else "N/A")
                print("📤 [RESPONSE] Sending response data:", response_data)
                return Response(response_data)
                
            except Exception as model_error:
                print(f"Model prediction error, falling back to simple matching: {str(model_error)}")
                # Fall back to the predict_symptoms function
                return predict_symptoms(request)
                
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error in PredictView: {error_trace}")
            return Response({
                'status': 'error',
                'message': 'An error occurred while processing your request',
                'details': str(e)
            }, status=500)


# Chat view
@api_view(['GET'])
@permission_classes([AllowAny])
def chat_view(request):
    """Render the chat interface."""
    # For demo purposes, we'll use a default user
    # In a real app, you'd get the authenticated user
    user = request.user if request.user.is_authenticated else None
    
    # Create a new conversation if none exists
    conversation = None
    if user:
        conversation = Conversation.objects.filter(user=user).order_by('-created_at').first()
        if not conversation:
            conversation = Conversation.objects.create(user=user, title="New Chat")
    
    context = {
        'user': user,
        'conversation_id': conversation.id if conversation else None,
        'title': conversation.title if conversation else 'New Chat'
    }
    
    return render(request, 'chat/chat.html', context)


# API endpoint for chat predictions
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def predict_symptoms(request):
    """Handle symptom prediction from the chat interface."""
    try:
        # Use request.data which is already parsed by DRF's parsers
        data = request.data
        
        # Handle both form data and JSON input
        if isinstance(data, dict):
            symptoms = data.get('symptoms', '')
            conversation_id = data.get('conversation_id')
        else:
            symptoms = ''
            conversation_id = None
        
        # If no symptoms in the parsed data, try to get raw body as fallback
        if not symptoms and request.body:
            try:
                body_data = json.loads(request.body.decode('utf-8'))
                symptoms = body_data.get('symptoms', '')
                if not conversation_id and 'conversation_id' in body_data:
                    conversation_id = body_data['conversation_id']
            except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
                pass
        
        if not symptoms:
            return Response({
                'status': 'error',
                'message': 'No symptoms provided in the request'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create conversation
        conversation = None
        is_new_conversation = False
        title = (symptoms[:50] + '...') if len(symptoms) > 50 else symptoms
        
        if request.user.is_authenticated:
            try:
                if not conversation_id:
                    conversation = Conversation.objects.create(user=request.user, title=title)
                    conversation_id = conversation.id
                    is_new_conversation = True
                else:
                    conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            except Exception as e:
                print(f"Error handling conversation: {str(e)}")
                # Continue without conversation handling if there's an error
        
        # Save user message to database if we have a conversation
        if conversation and request.user.is_authenticated:
            Message.objects.create(
                conversation=conversation,
                is_user=True,
                text=symptoms
            )
        
        # Use the exact path to the disease data file
        try:
            # The exact path to the disease data file
            disease_file_path = r'C:\Users\Faisa\OneDrive\Documents\GitHub\Graduation-Project\chat\static\chat\data\24-Disease.json'
            
            print(f"\n=== Loading disease data from: {disease_file_path} ===")
            
            # Check if file exists
            if not os.path.exists(disease_file_path):
                raise FileNotFoundError(f"Disease data file not found at: {disease_file_path}")
            
            with open(disease_file_path, 'r', encoding='utf-8') as f:
                disease_data = json.load(f)
                print(f"✅ Successfully loaded disease data with {len(disease_data)} entries")
            
            # Simple keyword matching for demo
            matched_diseases = []
            for disease in disease_data:
                # Match based on disease name or description containing the symptoms
                disease_name = disease.get('name', '').lower()
                disease_description = disease.get('description', '').lower()
                symptoms_lower = symptoms.lower()
                
                # Check if any part of the symptoms matches the disease name or description
                if (symptoms_lower in disease_name or 
                    disease_name in symptoms_lower or
                    any(word in disease_description for word in symptoms_lower.split()) or
                    any(word in symptoms_lower for word in disease_name.split())):
                    
                    # Format the disease data to match frontend expectations
                    disease_info = {
                        'name': disease.get('name', 'Unknown'),
                        'description': disease.get('description', 'No description available'),
                        'homeCare': disease.get('homeCare', ''),
                        'medications': disease.get('medications', ''),
                        'lifestyle': disease.get('lifestyle', ''),
                        'whenToSeeDoctor': disease.get('whenToSeeDoctor', ''),
                        'confidence': 85  # Default confidence score, can be calculated based on matching
                    }
                    matched_diseases.append(disease_info)
            
            if matched_diseases:
                # Get the first matched disease
                disease_info = matched_diseases[0]
                
                # Create the response with all required fields, ensuring none are missing
                disease_response = {
                    'name': disease_info.get('name', 'Unknown'),
                    'description': disease_info.get('description', 'No description available'),
                    'homeCare': disease_info.get('homeCare', ''),
                    'medications': disease_info.get('medications', ''),
                    'lifestyle': disease_info.get('lifestyle', ''),
                    'whenToSeeDoctor': disease_info.get('whenToSeeDoctor', ''),
                    'confidence': disease_info.get('confidence', 0)
                }
                
                # Create the response with the expected format for the frontend
                response_data = {
                    'status': 'success',
                    'data': {
                        'disease': disease_response,
                        'conversation_id': str(conversation_id) if conversation_id else None
                    },
                    'conversation_id': str(conversation_id) if conversation_id else None,
                    'is_new_conversation': is_new_conversation
                }
                print(f"✅ Found {len(matched_diseases)} matching diseases")
            else:
                response_data = {
                    'status': 'not_found',
                    'message': 'No matching conditions found. Please provide more details about your symptoms.',
                    'conversation_id': str(conversation_id) if conversation_id else None,
                    'is_new_conversation': is_new_conversation
                }
                print("ℹ️ No matching diseases found for the given symptoms")
                
            # Save AI response to database if we have a conversation
            if conversation and request.user.is_authenticated and 'data' in response_data:
                ai_message_text = json.dumps(response_data['data']) if 'data' in response_data else response_data.get('message', '')
                Message.objects.create(
                    conversation=conversation,
                    is_user=False,
                    text=ai_message_text
                )
                
            return Response(response_data)
            
        except json.JSONDecodeError as e:
            return Response({
                'status': 'error',
                'message': 'Invalid JSON data in disease file'
            }, status=500)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'status': 'error',
                'message': f'Error processing disease data: {str(e)}'
            }, status=500)
            
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Invalid JSON data in request',
            'details': str(e)
        }, status=400)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in predict_symptoms: {error_trace}")
        return Response({
            'status': 'error',
            'message': 'An error occurred while processing your request',
            'details': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def welcome_view(request):
    return render(request, 'chat/welcome.html')

@api_view(['GET'])
@permission_classes([AllowAny])
def faq_view(request):
    return render(request, 'chat/faq.html')

@api_view(['GET'])
@permission_classes([AllowAny])
def signin_view(request):
    return render(request, 'chat/signin.html')

@api_view(['GET'])
@permission_classes([AllowAny])
def index_view(request):
    return render(request, 'chat/index.html')

@api_view(['GET'])
@permission_classes([AllowAny])
def topic_test_view(request):
    return render(request, 'chat/topic-test.html')

# 🟢 Get single conversation by ID
class ConversationDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, conversation_id):
        try:
            # Get the conversation and ensure it belongs to the authenticated user
            conversation = get_object_or_404(
                Conversation.objects.prefetch_related('messages').filter(user=request.user),
                id=conversation_id
            )
            
            serializer = ConversationDetailSerializer(conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
