from langchain_community.llms import Bedrock

prompt="質問：味噌汁の作り方を説明してください。"

# Mistral (とりあえずboto3直接)
import boto3
import json

# Mistral 7B
bedrock = boto3.client('bedrock-runtime', region_name = "us-west-2")
body = json.dumps({"prompt": prompt,"max_tokens": 1000})
modelId = 'mistral.mistral-7b-instruct-v0:2'
accept = 'application/json'
contentType = 'application/json'
response = bedrock.invoke_model(body=body, modelId=modelId, accept=accept, contentType=contentType)
response_body = json.loads(response.get('body').read())
answer = response_body['outputs'][0]['text']
print("Mistral 7B:" + answer + "\n")

# Mistral 8x7B
bedrock = boto3.client('bedrock-runtime', region_name = "us-west-2")
body = json.dumps({"prompt": prompt,"max_tokens": 1000})
modelId = 'mistral.mixtral-8x7b-instruct-v0:1'
accept = 'application/json'
contentType = 'application/json'
response = bedrock.invoke_model(body=body, modelId=modelId, accept=accept, contentType=contentType)
response_body = json.loads(response.get('body').read())
answer = response_body['outputs'][0]['text']
print("Mistral 8x7B:" + answer + "\n")

# Jurassic-2 Mid
llm = Bedrock(model_id="ai21.j2-mid-v1",model_kwargs={"maxTokens":1000})
answer = llm.invoke(prompt)
print("Jurassic-2 Mid: " + answer + "\n")

# Jurassic-2 Ultra
llm = Bedrock(model_id="ai21.j2-ultra-v1",model_kwargs={"maxTokens":1000})
answer = llm.invoke(prompt)
print("Jurassic-2 Ultra: " + answer + "\n")

# Titan Text G1 - Lite
llm = Bedrock(model_id="amazon.titan-text-lite-v1",model_kwargs={"maxTokenCount":1000})
answer = llm.invoke(prompt)
print("Titan Text G1 - Lite: " + answer + "\n")

# Titan Text G1 - Express
llm = Bedrock(model_id="amazon.titan-text-express-v1",model_kwargs={"maxTokenCount":1000})
answer = llm.invoke(prompt)
print("Titan Text G1 - Express: " + answer + "\n")

# Claude Instant
llm = Bedrock(model_id="anthropic.claude-instant-v1",model_kwargs={"max_tokens_to_sample": 1000})
answer = llm.invoke(prompt)
print("Claude Instant: " + answer + "\n")

# Claude2.1
llm = Bedrock(model_id="anthropic.claude-v2:1",model_kwargs={"max_tokens_to_sample": 1000})
answer = llm.invoke(prompt)
print("Claude2.1: " + answer + "\n")

# Command-Light
llm = Bedrock(model_id="cohere.command-light-text-v14",model_kwargs={"max_tokens": 1000})
answer = llm.invoke(prompt)
print("Command-Light: " + answer + "\n")

# Command
llm = Bedrock(model_id="cohere.command-text-v14",model_kwargs={"max_tokens": 1000})
answer = llm.invoke(prompt)
print("Command: " + answer + "\n")

# Llama 2 Chat 13B
llm = Bedrock(model_id="meta.llama2-13b-chat-v1",model_kwargs={"max_gen_len": 1000})
answer = llm.invoke(prompt)
print("Llama 2 Chat 13B: " + answer + "\n")

# Llama 2 Chat 70B
llm = Bedrock(model_id="meta.llama2-70b-chat-v1",model_kwargs={"max_gen_len": 1000})
answer = llm.invoke(prompt)
print("Llama 2 Chat 70B: " + answer + "\n")
