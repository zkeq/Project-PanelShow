FROM frankfang128/oh-my-docker:mangosteen

SHELL ["zsh", "-c"]
# nvm

RUN source ~/.zshrc && \
    nvm install 20 && \
    nvm use 20 && \
    node --version
# install frontend dependencies
RUN ls / -a
RUN source ~/.zshrc && \
    ls -a

# install Claude Code
RUN source ~/.zshrc && \
    npm install -g @anthropic-ai/claude-code

RUN echo "unset CI" >> ~/.zshrc

RUN echo "export ANTHROPIC_BASE_URL=https://code.imyaichat.com" >> ~/.zshrc && \
    echo "export ANTHROPIC_AUTH_TOKEN=sk-YThp8qwJxpq6ZDERR1zqPuDqabq5Oix7StA8vAyONjS762DR" >> ~/.zshrc
# 以及按需安装其他软件
# RUN apt-get update && apt-get install -y wget unzip openssh-server yarn htop