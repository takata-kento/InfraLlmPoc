from langchain_community.llms import Bedrock
from langchain.callbacks import StreamingStdOutCallbackHandler

prompt_en="QUESTION:How to cook Miso soup?"
prompt_jp="質問：味噌汁の作り方を説明してください。"

# Mistral (とりあえずboto3直接)
import boto3

def lambda_handler(event, context):
    bedrock = boto3.client('bedrock-runtime', region_name = "ap-northeast-1")

    # Titan Text G1 - Express
    llm = Bedrock(
        model_id="amazon.titan-text-express-v1",
        client=bedrock,
        model_kwargs={
            "maxTokenCount":1000
        },
        region_name="ap-northeast-1",
        streaming=True,
        callbacks=[StreamingStdOutCallbackHandler()])
    llm.predict(prompt_en)
    llm.predict(prompt_jp)