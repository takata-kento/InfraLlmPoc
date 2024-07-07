from langchain_aws import BedrockLLM

prompt_en="QUESTION:How to cook Miso soup?"
prompt_jp="質問：味噌汁の作り方を説明してください。"

# Mistral (とりあえずboto3直接)
import boto3

def lambda_handler(event, context):
    bedrock = boto3.client('bedrock-runtime', region_name = "ap-northeast-1")

    # Titan Text G1 - Express
    llm = BedrockLLM(model_id="amazon.titan-text-express-v1",model_kwargs={"maxTokenCount":1000})
    answer_en = llm.invoke(prompt_en)
    print("Titan Text G1 - Express: " + answer_en + "\n")
    answer_jp = llm.invoke(prompt_jp)
    print("Titan Text G1 - Express: " + answer_jp + "\n")