import os

def download_model():
    url = "https://drive.google.com/uc?id=1rx6cbybVAfwK5g_I9wjfQfRac0-1NZVH"
    output_path = "model/model.safetensors"
    os.makedirs("model", exist_ok=True)

    if not os.path.exists(output_path):
        try:
            import gdown
        except ImportError:
            os.system("pip install gdown")
            import gdown

        print("Downloading model...")
        gdown.download(url, output_path, quiet=False)
        print("Model downloaded to:", output_path)
    else:
        print("Model already exists.")

if __name__ == "__main__":
    download_model()
