#!/bin/bash

helm upgrade --install darkreader -n darkreader --create-namespace -f ./values-ingress-prod.yaml ./darkreader
