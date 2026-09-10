<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomPasswordResetNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $resetUrl = rtrim(config('app.client_url'), '/')
            . '/?token=' . urlencode($this->token)
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Reset Your WFPPOAS Password')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $resetUrl)
            ->line('This password reset link will expire in 60 minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
