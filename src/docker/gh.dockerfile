# Stage 0: builder
FROM alpine:3.13.5 AS builder

# Set current Github  CLI version
ARG GH_VERSION=2.2.0

RUN apk add --no-cache wget rsync && \
  wget https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_amd64.tar.gz && \
  tar -zxvf gh_${GH_VERSION}_linux_amd64.tar.gz && \
  chmod +x gh_${GH_VERSION}_linux_amd64/bin/gh && \
  rsync -az --remove-source-files gh_${GH_VERSION}_linux_amd64/bin/ /usr/bin

# Stage 1: gh
FROM alpine:3.13.5 AS gh

RUN apk add --no-cache git libc6-compat
COPY --from=builder /usr/bin/gh /usr/bin/
#RUN gh auth login --web

VOLUME /gh
WORKDIR /gh

ENTRYPOINT ["gh"]
CMD ["--help"]