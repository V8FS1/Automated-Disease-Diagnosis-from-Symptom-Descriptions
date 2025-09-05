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
├── data/                # Dataset (Symptom2Disease )  
├── model/              # Fine-tuned transformer models  
├── MedicalAi/             # Web Deployment files 
├── MedicalAi/requirements.txt     # Dependencies  
├── README.md            # Project documentation  
```

---

## ⚙️ Installation & Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/V8FS1/Automated-Disease-Diagnosis-from-Symptom-Descriptions.git
   cd Automated-Disease-Diagnosis-from-Symptom-Descriptions
   ```

2. Create a virtual environment and install dependencies
Option A — Python venv (recommended)

macOS / Linux
   ```bash
   # from the project root
   python3 -m venv .venv
   source .venv/bin/activate
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```
Windows (PowerShell)
 ```bash
   # from the project root
   python -m venv .venv
   .venv\Scripts\Activate
   python -m pip install --upgrade pip
   pip install -r requirements.txt

   ```
3) Database Setup
 ```bash
python manage.py migrate
 ```
3. Launch the Development Server:

   ```bash
   python manage.py runserver
   ```

---

## 📊 Results For best Models

| Model                        | Test Accuracy | Real-World Top-1 | Real-World Top-3 |
| ---------------------------- | ------------- | ---------------- | ---------------- |
| ClinicalBERT (Text + NER)    | 90.3%         | 87.50%           | 100%             |
| BioMedBERT + NER             | 90.4%         | 89.58%           | 95.8%            |
| **RoBERTa + NER**            | **95.0%**     | **95.8%**        | **100%**         |

---

## 🎯 Use Cases

* **Telemedicine platforms** → AI-assisted triage for remote diagnosis.  
* **Healthcare chatbots** → symptom-based disease prediction.  
* **Clinical decision support** → assist doctors in primary care or emergency triage.  

---

## 📖 Future Work

* Expand dataset with real patient narratives.  
* Add **multilingual support** for global healthcare.  
* Integrate **clinical metadata** (age, gender, vitals) for personalized predictions.  
* Improve **model interpretability** for clinicians.  
* Conduct **real-world clinical trials** for validation.  

---

## 👤 Author

**Faisal Salama**  
B.Sc. Software Engineering | Üsküdar University  
📧 Email: [faisalslamav8@gmail.com](mailto:faisalslamav8@gmail.com)  
🔗 LinkedIn: www.linkedin.com/in/salamafaisal 
💻 GitHub: [V8FS1](https://github.com/V8FS1)  

