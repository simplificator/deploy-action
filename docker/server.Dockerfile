FROM geerlingguy/docker-debian12-ansible

RUN apt update && \
  apt install -y ca-certificates curl gnupg openssh-server && \
  install -m 0755 -d /etc/apt/keyrings && \
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
  chmod a+r /etc/apt/keyrings/docker.gpg && \
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
  apt update && \
  apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

RUN echo "PermitEmptyPasswords yes \n \
PermitRootLogin yes \n \
PasswordAuthentication yes" > /etc/ssh/sshd_config

RUN adduser david && \
  usermod -aG docker david && \
  echo "david ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/david && \
  passwd -d david
