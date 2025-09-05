from transformers import pipeline
pipeline("text-classification", model="./model", tokenizer="./model", local_files_only=True)
