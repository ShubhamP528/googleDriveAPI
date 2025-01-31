import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Email configuration
smtp_server = 'smtp.gmail.com'
smtp_port = 587  # Change it according to your SMTP server settings
sender_email = 'EMAIL ADDRESS'
sender_password = 'APP PASSWORD FOR THT EMAIL'  # Creat app password, 

# List of recipients
recipients = ['RECIPIENTS EMAIL ADDRESS']

# Create message container
msg = MIMEMultipart()
msg['From'] = sender_email
msg['To'] = ', '.join(recipients)
msg['Subject'] = 'Subject of your email'

# Email body
body = 'This is the body of your email.'
msg.attach(MIMEText(body, 'plain'))

# Connect to SMTP server and send email
try:
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(sender_email, sender_password)
    text = msg.as_string()
    server.sendmail(sender_email, recipients, text)
    print('Email sent successfully!')
except Exception as e:
    print('Email sending failed:', str(e))
finally:
    server.quit()
