import * as aws from "@pulumi/aws";
import * as archive from "@pulumi/archive";
import * as assert from "@pulumi/pulumi/asset";
import { LogGroup } from "@pulumi/aws/cloudwatch";
import { Function } from "@pulumi/aws/lambda";

// Lambdaリソース作成クラス
export class ResourceLambda {
    /**
     * 実行ロール
     */
    private iamRole: string;
    /**
     * Lambda関数名
     */
    private functionName: string;
    /**
     * Lambdaソースコードファイル
     */
    private codeFile: string;
    /**
     * CloudWatchLogs ロググループリソース
     */
    private cloudWatchLogGroup: LogGroup | null = null;
    /**
     * Lambdaランタイム
     * 基本的にpythonのみを想定しているため固定
     */
    private RUNTIME = "python3.9";

    /**
     * Lambdaリソースを作成するための初期化を行います。
     * @param _iamRole ラムダ実行ロール
     * @param _functionName Lambda関数名
     * @param _codeFile Lambdaソースコードファイル
     */
    constructor(_iamRole: string, _functionName: string, _codeFile: string){
        this.iamRole = _iamRole;
        this.functionName = _functionName; this.codeFile = _codeFile;
    }

    /**
     * Lambdaリソースに設定するIAMロールARNを取得します。
     * @returns IAMロールARN
     */
    get getIamRole(): string{
        return this.iamRole;
    }

    /**
     * Lambdaリソースに設定する関数名を取得します。
     * @returns Lambda関数名
     */
    get getFunctionName(): string{
        return this.functionName;
    }

    /**
     * Lambdaリソースに設定するソースファイルのディレクトリを取得します。
     * @returns ソースファイルディレクトリ
     */
    get getCodeFile(): string{
        return this.codeFile;
    }

    /**
     * Lambdaリソースに設定するCloudWatchLogsロググループリソースを取得します。
     * @returns CloudWatchLogsロググループリソース
     */
    get getCloudWatchLogGroup(): LogGroup | null{
        return this.cloudWatchLogGroup;
    }

    /**
     * Lambdaリソースを作成します。
     * @param _provider CICD実行ロールにAssumeRoleするためのProvider
     * @returns Lambdaリソースを表すインスタンス
     */
    public create(_provider: aws.Provider): Function | null{
        let codeZip: Promise<archive.GetFileResult>;
        let lambdaFunction: Function | null = null;
        let logGroup: LogGroup;
        
        // Lambdaソースコードファイルをzip化します。
        try{
            codeZip = archive.getFile({
                type: "zip",
                sourceFile: this.codeFile,
                outputPath: "./Resources/Lambda/LambdaSrc/zip/python/lambda.zip"
            });
        }catch(e){
            console.log("zipファイル作成中にエラーが発生しました。");
            console.log(e);
            return lambdaFunction;
        }

        // ログ出力用のCloudWatchLogs ロググループを作成します。
        logGroup = this.createCloudWatchForLambda(_provider);

        // Lambdaリソースを作成します。
        lambdaFunction = new aws.lambda.Function(this.functionName,{
            code: new assert.FileArchive("./Resources/Lambda/LambdaSrc/zip/python/lambdafunc.zip"),
            name: this.functionName,
            role: this.iamRole,
            sourceCodeHash: codeZip.then(lambda => lambda.outputBase64sha256),
            handler: "lambdaFunc.lambda_handler",
            runtime: this.RUNTIME,
            loggingConfig: {
                logFormat: "Text",
            },
            timeout: 30
        },{
            provider: _provider,
            dependsOn: [
                logGroup
            ]
        })

        return lambdaFunction;
    }

    /**
     * Lambdaリソース用のCloudWatchロググループを作成します。
     * @param _provider CICD実行ロールにAssumeRoleするためのProvider
     * @returns CloudWatchLogsのロググループリソースを表すインスタンス
     */
    private createCloudWatchForLambda(_provider: aws.Provider): LogGroup{
        this.cloudWatchLogGroup = new aws.cloudwatch.LogGroup(this.functionName,{
            name: `/aws/lambda/${this.functionName}`,
            retentionInDays: 14
        },{
            provider: _provider
        });
    
        return this.cloudWatchLogGroup;
    }
}