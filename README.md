# 🩺 Automated Disease Diagnosis from Symptom Descriptions

## 📌 Project Overview
This project presents an **AI-powered system for predicting diseases** from **free-text, patient-style symptom descriptions** using advanced **Natural Language Processing (NLP)** techniques.  
Unlike traditional models that rely on structured or short-text inputs, this system is designed to understand **real-world, unstructured patient language** and provide accurate predictions across **24 disease categories**.

The final pipeline integrates **transformer-based models (BERT, ClinicalBERT, BioBERT, RoBERTa)**, **Named Entity Recognition (NER)**, and **data augmentation using LLMs**, achieving:

- ✅ **95% test accuracy**  
- ✅ **96% validation accuracy**  
- ✅ **100% Top-3 accuracy on real-world simulated patient cases**

The system is deployed in a **web interface**, making it accessible for **telemedicine and patient-facing applications**.

---

## 🚀 Features
- 📝 **Free-text symptom input** → handles unstructured, natural patient descriptions.  
- 🤖 **Transformer-based classification** → fine-tuned BERT, BioBERT, ClinicalBERT, PubMedBERT, and RoBERTa models.  
- 🔍 **NER-enhanced predictions** → integrates biomedical entities for improved robustness.  
- 🧠 **Data augmentation with LLMs** → expanded dataset with 240+ clinically validated symptom variations.  
- 🌐 **Web deployment** → real-time predictions with disease summaries and follow-up guidance.  

---

## 🛠️ Tech Stack
- **Programming**: Python  
- **Libraries/Frameworks**: Hugging Face Transformers, TensorFlow, Scikit-learn, SpaCy, SciSpacy, Pandas, NumPy  
- **Models**: BERT, ClinicalBERT, BioBERT, PubMedBERT, RoBERTa  
- **Deployment**: Flask/Django + Web Interface  
- **Version Control**: Git/GitHub  

---

## 📂 Project Structure
```bash
├── Dataset(Before Expanding)/                # Dataset (Symptom2Disease + augmented samples)  
├── models/              # Fine-tuned transformer models  
├── MedicalAi/             # Web Deployment files  
├── MedicalAi/requirements.txt     # Dependencies  
├── README.md            # Project documentation  


⚙️ Installation & Setup

Clone the repository:

git clone https://github.com/your-username/disease-diagnosis-nlp.git
cd disease-diagnosis-nlp


Create a virtual environment and install dependencies:

pip install -r requirements.txt


Run preprocessing and model training (optional):

python train_model.py


Launch the web app:

python app.py

📊 Results
Model	Validation Accuracy	Test Accuracy	Real-World Top-1	Real-World Top-3
Logistic Regression (TF-IDF)	96%	98%	33%	50%
ClinicalBERT + NER	91.7%	90.3%	100%	100%
BioMedBERT + NER	94.4%	90.4%	95.8%	95.8%
RoBERTa + NER	96.1%	95.0%	95.8%	100%
🎯 Use Cases

Telemedicine platforms → AI-assisted triage for remote diagnosis.

Healthcare chatbots → symptom-based disease prediction.

Clinical decision support → assist doctors in primary care or emergency triage.

📖 Future Work

Expand dataset with real patient narratives.

Add multilingual support for global healthcare.

Integrate clinical metadata (age, gender, vitals) for personalized predictions.

Improve model interpretability for clinicians.

Conduct real-world clinical trials for validation.

👤 Author

Faisal Salama
B.Sc. Software Engineering | Üsküdar University
📧 Email: faisalslamav8@gmail.com

🔗 LinkedIn: [Your LinkedIn]
💻 GitHub: [Your GitHub]


├── requirements.txt     # Dependencies  
├── README.md            # Project documentation  
