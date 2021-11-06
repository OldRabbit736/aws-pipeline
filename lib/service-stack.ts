import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { Function, Code, Runtime } from "@aws-cdk/aws-lambda";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

export class ServiceStack extends Stack {
  public readonly serviceCode: Code;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.serviceCode = Code.fromCfnParameters();

    const lambdda = new Function(this, "ServiceLambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "src/lambda.handler",
      code: this.serviceCode,
      functionName: "ServiceLambda",
    });

    new HttpApi(this, "ServiceAPI", {
      defaultIntegration: new LambdaProxyIntegration({
        handler: lambdda,
      }),
      apiName: "MyService",
    });
  }
}