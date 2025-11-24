FROM docker:dind

# Install OpenSSH and other needed packages
RUN apk add --no-cache openssh sudo

# Configure SSH
RUN ssh-keygen -A && \
    echo "PermitEmptyPasswords yes" >> /etc/ssh/sshd_config && \
    echo "PermitRootLogin yes" >> /etc/ssh/sshd_config && \
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config

# Create user david
RUN adduser -D david && \
    addgroup david docker && \
    echo "david ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/david && \
    passwd -d david

# Start both dockerd and sshd
CMD dockerd-entrypoint.sh & /usr/sbin/sshd -D
