# Pingpong App
build the image first using
`docker build -t [repo/imagename:tag] pingpong`
change the image in the `manifests/pingpong-k8s.yaml` with [repo/imagename:tag]

deploy using `kubectl apply -f manifests/` integrate with Log-output app