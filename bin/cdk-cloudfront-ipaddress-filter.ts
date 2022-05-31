#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkCloudfrontIpaddressFilterStack } from '../lib/cdk-cloudfront-ipaddress-filter-stack'

const app = new cdk.App()
new CdkCloudfrontIpaddressFilterStack(
  app,
  'CdkCloudfrontIpaddressFilterStack',
  {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    ipAddress: process.env.IP_ADDRESS!
  }
)
