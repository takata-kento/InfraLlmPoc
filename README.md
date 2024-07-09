# InfraLlmPoc
## About this repository
Amazon Bedrockを使用した基盤モデル検証用インフラ

## 使用している環境
* pulumi バージョン3.121.0
* TypeScript
  * pulumi実装に使用

## ローカル環境構築
docker image pulumi/pulumi-nodejs:3.121.0をdockerhubよりプル
`docker pull pulumi/pulumi-nodejs:3.121.0`
プルしたイメージをもとにコンテナ作成
```docker run --name pulumiNodeServer -d -it --mount type=bind,source={OS絶対ディレクトリ},target=/pulumi/projects --env AWS_ACCESS_KEY_ID={設定値} --env AWS_SECRET_ACCESS_KEY={設定値} --env PULUMI_ACCESS_TOKEN={設定値} pulumi/pulumi-nodejs:3.121.0 /bin/bash```