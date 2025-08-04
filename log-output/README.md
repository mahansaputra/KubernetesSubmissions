# Log-output App
build the image first using
`docker build -t [repo/imagename:tag] log-output`
change the image in the `manifests/log-output-k8s.yaml` with [repo/imagename:tag]

deploy using `kubectl apply -f manifests/` integrate with Pingpong app