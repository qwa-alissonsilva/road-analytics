# Road Analytics

Sistema de análise automática de condições de estradas usando processamento de imagem e inteligência artificial.

## Funcionalidades

- Análise automática de imagens de estradas
- Detecção de buracos, rachaduras e irregularidades
- Avaliação de condições de iluminação e textura do pavimento
- Interface web para upload e visualização dos resultados
- Histórico de análises realizadas

## Estrutura do Projeto

- `roadCheck-app/`: Backend em Python com FastAPI
- `roadCheck-web/`: Frontend em HTML/CSS/JavaScript
- `roadAnalystic/`: Módulo principal de análise

## Requisitos

### Backend
- Python 3.8+
- FastAPI
- OpenCV
- NumPy
- scikit-learn

### Frontend
- Navegador web moderno com suporte a JavaScript

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências do backend:
```bash
cd roadCheck-app
pip install -r requirements.txt
```

3. Inicie o servidor:
```bash
uvicorn app:app --reload
```

4. Abra o frontend em um navegador:
- Abra o arquivo `roadCheck-web/analise.html` em seu navegador

## Uso

1. Acesse a interface web
2. Faça upload de uma imagem de estrada
3. Aguarde a análise automática
4. Visualize os resultados e recomendações

## Características da Análise

- Detecção de buracos (área e quantidade)
- Análise de textura do pavimento
- Avaliação de uniformidade da superfície
- Verificação de condições de iluminação
- Geração de recomendações baseadas na análise

## Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit de suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 