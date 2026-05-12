<?php
// Contact form handler for ITNI website

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

// Validate required fields
$errors = [];

if (empty($name)) {
    $errors[] = 'Nome é obrigatório';
}

if (empty($phone)) {
    $errors[] = 'Telefone é obrigatório';
}

if (empty($email)) {
    $errors[] = 'E-mail é obrigatório';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'E-mail inválido';
}

if (empty($message)) {
    $errors[] = 'Mensagem é obrigatória';
}

// If there are validation errors
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, corrija os erros abaixo:',
        'errors' => $errors
    ]);
    exit;
}

// Email configuration
$to = 'contato@itni.com.br';
$subject = 'Nova mensagem de contato - ITNI Website';

// Create email content
$email_content = "
Nova mensagem recebida através do site ITNI:

Nome: $name
Telefone: $phone
E-mail: $email

Mensagem:
$message

---
Enviado em: " . date('d/m/Y H:i:s') . "
";

// Sanitize email to prevent header injection
$email_safe = filter_var($email, FILTER_SANITIZE_EMAIL);
$name_safe = preg_replace('/[^a-zA-Z0-9\s\-\.]/', '', $name);

// Email headers
$headers = [
    'From: ' . $email_safe,
    'Reply-To: ' . $email_safe,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
    'X-Priority: 3'
];

// Alternative: Store message in a log file if mail() fails
$log_file = __DIR__ . '/contact_log.txt';

// Send email
$mail_sent = @mail($to, $subject, $email_content, implode("\r\n", $headers));

// Get detailed error information if mail failed
$error_details = '';
$last_error = error_get_last();
if (!$mail_sent && $last_error) {
    $error_details = " | ERRO: " . $last_error['message'] . " (linha " . $last_error['line'] . ")";
}

// Create comprehensive log entry
$log_entry = "=== NOVO CONTATO - " . date('Y-m-d H:i:s') . " ===\n";
$log_entry .= "DESTINATÁRIO: $to\n";
$log_entry .= "ASSUNTO: $subject\n";
$log_entry .= "DADOS DO FORMULÁRIO:\n";
$log_entry .= "  - Nome: $name_safe\n";
$log_entry .= "  - Email: $email_safe\n";
$log_entry .= "  - Telefone: $phone\n";
$log_entry .= "  - Mensagem: " . str_replace("\n", "\n    ", trim($message)) . "\n";
$log_entry .= "HEADERS UTILIZADOS:\n";
$log_entry .= "  - From: $email_safe\n";
$log_entry .= "  - Reply-To: $email_safe\n";
$log_entry .= "  - Content-Type: text/plain; charset=UTF-8\n";
$log_entry .= "  - X-Mailer: PHP/" . phpversion() . "\n";
$log_entry .= "INFORMAÇÕES DO SERVIDOR:\n";
$log_entry .= "  - IP Cliente: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
$log_entry .= "  - User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'N/A') . "\n";
$log_entry .= "  - Método: " . $_SERVER['REQUEST_METHOD'] . "\n";
$log_entry .= "  - PHP Version: " . phpversion() . "\n";
$log_entry .= "  - Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'N/A') . "\n";
$log_entry .= "STATUS: " . ($mail_sent ? "ENVIADO COM SUCESSO" : "FALHA NO ENVIO$error_details") . "\n";
$log_entry .= "TIMESTAMP: " . date('Y-m-d H:i:s.u T') . "\n";
$log_entry .= "================================================================\n\n";

@file_put_contents($log_file, $log_entry, FILE_APPEND);

if ($mail_sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao enviar mensagem. Tente novamente ou entre em contato diretamente.'
    ]);
}
?>