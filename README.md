# ALEXA AS3 DEMO PROJECT

# F5 Alexa Demo to showcase Alexa Virtual Assistant Support for AS3 Declarative Interface 

## Introduction

Welcome to the git repository for the F5 Alexa Demo.  

This project provides support for an Alexa Skill to manage applications on a VE in AWS leveraging the AS3 declarative interface.

With this skill set Administrators can:
  1) Fully automated deployment using AWS EC2 instance tags
  2) Manually create/delete applications and all resources associated with the application
  3) Discover AWS EC2 instances based on tag and and add to an application pool
  3) Add/Delete servers from an application
  4) List servers associated with an application
  5) Visualize AS3 created deployments

Project Components
  1) Alexa Skill to manage VE - alexaAs3Skill.json
  2) Lambda to translate Alexa Intents to AS3 requests - as3AlexaLib
  3) AS3 deployments visualization WebApp 
      * Lambda function to enable WebApp to discover AWS EC2 resources - AWSDiscovery
      * Lambda function to enable WebApp to query state of AS3 created resources on the VE - as3Services

Deployment Steps
  1) In progress

The Alexa demo project is located at:
(https://github.com/F5Solutions/alexaas3)

## ALEXA SUPPORTED AS3 TOPOLOGY
![topology](https://user-images.githubusercontent.com/5133302/43618132-97e951ea-967b-11e8-9d29-7a352fe7252c.png)

## UI DASHBOARD
![dashboard](https://user-images.githubusercontent.com/5133302/43617651-86a87fb2-9678-11e8-9e38-a69a0e0bc7e7.PNG)
