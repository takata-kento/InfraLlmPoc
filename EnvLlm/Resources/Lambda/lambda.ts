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
    private readonly iamRole: string;
    /**
     * Lambda関数名
     */
    private readonly functionName: string;
    /**
     * Lambdaソースコードファイル
     */
    private readonly codeFile: string;
    /**
     * Lambdaランタイム
     * 基本的にpythonのみを想定しているため固定
     */
    private readonly RUNTIME = "python3.7";

    /**
     * Lambdaリソースを作成するための初期化を行います。
     * @param iamRole ラムダ実行ロール
     * @param functionName Lambda関数名
     * @param codeFile Lambdaソースコードファイル
     */
    constructor(_iamRole: string, _functionName: string, _codeFile: string){
        this.iamRole = _iamRole;
        this.functionName = _functionName; this.codeFile = _codeFile;
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
                outputPath: "lambda.zip"
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
            code: new assert.FileArchive("lambda.zip"),
            name: this.functionName,
            role: this.iamRole,
            sourceCodeHash: codeZip.then(lambda => lambda.outputBase64sha256),
            runtime: this.RUNTIME,
            loggingConfig: {
                logFormat: "Text",
                systemLogLevel: "INFO"
            }
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
        return new aws.cloudwatch.LogGroup(this.functionName,{
            name: `/aws/lambda/${this.functionName}`,
            retentionInDays: 14
        },{
            provider: _provider
        });
    }
}