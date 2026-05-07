from openai import OpenAI

from app.core.config import get_settings


def generate_image(prompt: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    client = OpenAI(api_key=settings.openai_api_key)
    result = client.images.generate(
        model=settings.openai_image_model,
        prompt=prompt,
        size="1024x1024",
        n=1,
    )

    image = result.data[0]
    if image.url:
        return image.url
    if image.b64_json:
        return f"data:image/png;base64,{image.b64_json}"
    raise RuntimeError("Image generation did not return an image")

