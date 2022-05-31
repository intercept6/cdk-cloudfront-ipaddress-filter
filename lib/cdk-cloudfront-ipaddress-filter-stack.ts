import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { CachePolicy, Distribution, OriginProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront'
import { LoadBalancerV2Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import { ApplicationLoadBalancer, ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

interface CdkCloudfrontIpaddressFilterStackProps extends StackProps {
  ipAddress: string
}

export class CdkCloudfrontIpaddressFilterStack extends Stack {
  constructor(scope: Construct, id: string, props: CdkCloudfrontIpaddressFilterStackProps) {
    super(scope, id, props)

    const handler = new NodejsFunction(this, 'handler', {})

    const vpc = new Vpc(this, 'Vpc')
    const alb = new ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true
    })
    const bucket = new Bucket(this, 'Bucket')
    alb.logAccessLogs(bucket)
    const listener = alb
      .addListener('Listener', {
        port: 80,
        defaultAction: ListenerAction.fixedResponse(403, { contentType: 'text/plain', messageBody: 'Forbidden' })
      })

    listener.addTargets('LambdaTargets', {
      targets: [new LambdaTarget(handler)],
      conditions: [ListenerCondition.httpHeader('x-forwarded-for', [`*${props.ipAddress}*`])],
      priority: 2
    })

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new LoadBalancerV2Origin(alb, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY
        }),
        cachePolicy: CachePolicy.CACHING_DISABLED
      }
    })

    new CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName
    })

    new CfnOutput(this, 'LogBucket', { value: bucket.bucketArn })
  }
}
