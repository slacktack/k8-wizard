# Deploy everything
kubectl apply -f apps/simple-api/k8s/
kubectl apply -f apps/frontend/k8s/

# Check status
kubectl get all -n demo

# Access the frontend
kubectl port-forward -n demo svc/frontend 8080:80
# Open http://localhost:8080

# Access the API directly
kubectl port-forward -n demo svc/backend-api 3000:80
curl http://localhost:3000/health
curl http://localhost:3000/api/users

# Scale the API
kubectl scale -n demo deployment/backend-api --replicas=5

# Watch the pods
kubectl get pods -n demo -w

# Rolling update (change image)
kubectl set image -n demo deployment/backend-api api=simple-api:v2
kubectl rollout status -n demo deployment/backend-api

# Rollback if needed
kubectl rollout undo -n demo deployment/backend-api

# Clean up
kubectl delete namespace demo
