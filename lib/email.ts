import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!process.env.SMTP_HOST) {
    // In development without SMTP, just log
    console.log('[Email]', { to, subject });
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'SocialHub <noreply@socialhub.app>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

function emailTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .logo { font-size: 20px; font-weight: bold; color: #6366f1; margin-bottom: 24px; }
    .content { color: #374151; font-size: 15px; line-height: 1.6; }
    .content strong { color: #111827; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
    a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SocialHub</div>
    <div class="content">${content}</div>
    <div class="footer">Bạn nhận được email này vì bạn đã bật thông báo qua email trên SocialHub.<br>
    <a href="#">Hủy đăng ký</a> · <a href="#">Cài đặt thông báo</a></div>
  </div>
</body>
</html>
`;
}

export function notifyNewFollowerEmail(followerName: string, followerUsername: string, recipientName: string) {
  return {
    subject: `${followerName} đã theo dõi bạn trên SocialHub`,
    html: emailTemplate(`
      <p>Xin chào ${recipientName},</p>
      <p><strong>${followerName}</strong> (@${followerUsername}) vừa bắt đầu theo dõi bạn!</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${followerUsername}">Xem hồ sơ của ${followerName}</a></p>
    `),
  };
}

export function notifyNewLikeEmail(postAuthorName: string, likerName: string, likerUsername: string, postContent: string, postId: string) {
  return {
    subject: `${likerName} đã thích bài viết của bạn`,
    html: emailTemplate(`
      <p>Xin chào ${postAuthorName},</p>
      <p><strong>${likerName}</strong> vừa thích bài viết của bạn:</p>
      <p style="background:#f9fafb;padding:12px;border-radius:8px;font-style:italic;">"${postContent.slice(0, 100)}${postContent.length > 100 ? '...' : ''}"</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${likerUsername}">Xem hồ sơ của ${likerName}</a></p>
    `),
  };
}

export function notifyNewCommentEmail(postAuthorName: string, commenterName: string, commenterUsername: string, commentContent: string, postContent: string) {
  return {
    subject: `${commenterName} đã bình luận bài viết của bạn`,
    html: emailTemplate(`
      <p>Xin chào ${postAuthorName},</p>
      <p><strong>${commenterName}</strong> đã bình luận bài viết của bạn:</p>
      <p style="background:#f9fafb;padding:12px;border-radius:8px;">"${commentContent}"</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${commenterUsername}">Xem hồ sơ của ${commenterName}</a></p>
    `),
  };
}

export function notifyNewMessageEmail(recipientName: string, senderName: string, senderUsername: string, messageContent: string) {
  return {
    subject: `${senderName} đã nhắn tin cho bạn`,
    html: emailTemplate(`
      <p>Xin chào ${recipientName},</p>
      <p><strong>${senderName}</strong> đã gửi tin nhắn cho bạn:</p>
      <p style="background:#f9fafb;padding:12px;border-radius:8px;">"${messageContent.slice(0, 100)}${messageContent.length > 100 ? '...' : ''}"</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages/${senderUsername}">Trả lời tin nhắn</a></p>
    `),
  };
}