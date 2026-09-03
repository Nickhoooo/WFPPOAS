<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WFPPOAS Invitation</title>
</head>
<body style="margin: 0; background: #f3f4f6; font-family: Arial, sans-serif; color: #1e293b;">
    <div style="max-width: 560px; margin: 40px auto; padding: 24px;">
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h1 style="margin: 0 0 8px; color: #0f172a;">WFPPOAS</h1>
            <p style="margin: 0 0 24px; color: #64748b;">Workforce Performance and Project Operations Analytics System</p>

            <h2 style="color: #0f172a;">You are invited</h2>
            <p>Hello {{ $user->name }},</p>
            <p>An administrator created a WFPPOAS account for you. Set up your password to activate your account.</p>

            <p style="margin: 28px 0;">
                <a href="{{ $setupUrl }}" style="display: inline-block; padding: 12px 20px; border-radius: 8px; background: #0f172a; color: #ffffff; text-decoration: none;">
                    Set Up My Account
                </a>
            </p>

            <p style="font-size: 14px; color: #64748b;">This invitation expires in 48 hours and can only be used once.</p>
            <p style="font-size: 14px; color: #64748b;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="font-size: 13px; word-break: break-all; color: #475569;">{{ $setupUrl }}</p>
        </div>
    </div>
</body>
</html>
