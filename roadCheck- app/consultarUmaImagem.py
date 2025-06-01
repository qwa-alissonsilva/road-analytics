import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
import cv2
import matplotlib.pyplot as plt

# ---- MAPEAMENTO ----
tipo_map = {0: "asfalto", 1: "pavimento", 2: "sempavimento"}
qualidade_map = {0: "bom", 1: "regular", 2: "ruim"}

# ---- TRANSFORMAÇÃO ----
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# ---- MODELO MULTI-TASK ----
class MultiTaskModel(nn.Module):
    def __init__(self):
        super().__init__()
        base_model = models.resnet18(weights=None)
        self.features = nn.Sequential(*list(base_model.children())[:-1])
        self.fc_tipo = nn.Linear(512, 3)
        self.fc_qualidade = nn.Linear(512, 3)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.fc_tipo(x), self.fc_qualidade(x)

# ---- GRAD-CAM ----
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model.eval()
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate_cam(self, input_tensor, index, head='tipo'):
        self.model.zero_grad()
        tipo_out, qual_out = self.model(input_tensor)

        if head == 'tipo':
            score = tipo_out[:, index]
        else:
            score = qual_out[:, index]

        score.backward(retain_graph=True)

        gradients = self.gradients[0].detach().cpu().numpy()
        activations = self.activations[0].detach().cpu().numpy()

        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)

        for i, w in enumerate(weights):
            cam += w * activations[i]

        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (224, 224))
        cam -= cam.min()
        cam /= cam.max() + 1e-8
        return cam

# ---- FUNÇÃO DE PREDIÇÃO COM GRAD-CAM ----
def prever_com_gradcam(img_path):
    model = MultiTaskModel()
    model.load_state_dict(torch.load("modelo_estrada.pth", map_location=torch.device("cpu")))
    model.eval()

    image = Image.open(img_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0)

    cam_extractor = GradCAM(model, model.features[-1])

    with torch.no_grad():
        tipo_out, qualidade_out = model(image_tensor)
        tipo_pred = torch.argmax(tipo_out, dim=1).item()
        qualidade_pred = torch.argmax(qualidade_out, dim=1).item()

    cam_tipo = cam_extractor.generate_cam(image_tensor, tipo_pred, head='tipo')

    tipo_nome = tipo_map[tipo_pred]

    if tipo_nome != "sempavimento":
        cam_qualidade = cam_extractor.generate_cam(image_tensor, qualidade_pred, head='qualidade')
        qualidade_nome = qualidade_map[qualidade_pred]
    else:
        cam_qualidade = None
        qualidade_nome = "não aplicável"

    # ---- Visualização ----
    img_np = np.array(image.resize((224, 224))).astype(np.uint8)
    heatmap_tipo = cv2.applyColorMap(np.uint8(255 * cam_tipo), cv2.COLORMAP_JET)
    superimposed_tipo = cv2.addWeighted(img_np, 0.5, heatmap_tipo, 0.5, 0)

    plt.figure(figsize=(10, 5))
    plt.subplot(1, 2, 1)
    plt.title(f"Tipo: {tipo_nome}")
    plt.imshow(superimposed_tipo)
    plt.axis("off")

    if cam_qualidade is not None:
        heatmap_qual = cv2.applyColorMap(np.uint8(255 * cam_qualidade), cv2.COLORMAP_JET)
        superimposed_qual = cv2.addWeighted(img_np, 0.5, heatmap_qual, 0.5, 0)
        plt.subplot(1, 2, 2)
        plt.title(f"Qualidade: {qualidade_nome}")
        plt.imshow(superimposed_qual)
        plt.axis("off")
    else:
        plt.subplot(1, 2, 2)
        plt.title("Qualidade: não aplicável")
        plt.imshow(img_np)
        plt.axis("off")

    plt.tight_layout()
    plt.savefig("resultado_gradcam.png")
    plt.show()

    print(f"\nResultado da imagem '{img_path}':")
    print(f"Tipo da estrada: {tipo_nome}")
    print(f"Qualidade da estrada: {qualidade_nome}")

# ---- CHAMADA DE TESTE ----
if __name__ == "__main__":
    prever_com_gradcam(r"C:\Users\lucas\Downloads\images.jpg")
