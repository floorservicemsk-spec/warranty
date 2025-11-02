<?php
// Настройки почты
$to_email = "your-email@example.com"; // ЗАМЕНИТЕ НА ВАШУ ПОЧТУ!
$subject = "Новая активация гарантии";

// Настройки Telegram
// ВАЖНО: Замените эти значения на ваши!
// Для получения токена бота: создайте бота через @BotFather в Telegram
// Для получения chat_id: отправьте сообщение боту и перейдите по ссылке https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
$telegram_bot_token = "YOUR_BOT_TOKEN_HERE"; // Замените на токен вашего бота
$telegram_chat_id = "YOUR_CHAT_ID_HERE"; // Замените на chat_id или @username

// Настройки Google Sheets
// ВАЖНО: Замените на URL вашего Google Apps Script Web App
// Инструкция по настройке в файле GOOGLE_SHEETS_SETUP.md
$google_sheets_url = "https://script.google.com/macros/s/AKfycbzVNgTa4xGYhHh0ioKEp2qTtLW2yfdksTacJVf0GziZcpwkWU7BwHUw8_QRxOB1Prsi/exec";

// Проверка метода запроса
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    die("Метод не разрешен");
}

// Получение данных из формы
$phone = isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : '';
$contract = isset($_POST['contract']) ? htmlspecialchars($_POST['contract']) : '';
$additional_work = isset($_POST['additional_work']) ? htmlspecialchars($_POST['additional_work']) : '';
$sales_rating = isset($_POST['sales_rating']) ? htmlspecialchars($_POST['sales_rating']) : '';
$delivery_rating = isset($_POST['delivery_rating']) ? htmlspecialchars($_POST['delivery_rating']) : '';
$installation_rating = isset($_POST['installation_rating']) ? htmlspecialchars($_POST['installation_rating']) : '';
$sales_feedback_bad = isset($_POST['sales_feedback_bad']) ? htmlspecialchars($_POST['sales_feedback_bad']) : '';
$delivery_feedback_bad = isset($_POST['delivery_feedback_bad']) ? htmlspecialchars($_POST['delivery_feedback_bad']) : '';
$installation_feedback_bad = isset($_POST['installation_feedback_bad']) ? htmlspecialchars($_POST['installation_feedback_bad']) : '';

// Дополнительные работы
$work_descriptions = isset($_POST['work_description']) ? $_POST['work_description'] : array();
$work_costs = isset($_POST['work_cost']) ? $_POST['work_cost'] : array();

// Скидки
$discounts = isset($_POST['discounts']) ? $_POST['discounts'] : array();

// Согласие
$consent = isset($_POST['consent']) ? 'Да' : 'Нет';

// Формирование HTML письма
$message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #BF081A; border-bottom: 2px solid #2f6f30; padding-bottom: 10px; }
        .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
        .section h3 { color: #2f6f30; margin-top: 0; }
        .field { margin: 10px 0; }
        .field strong { color: #555; }
        .rating { font-size: 20px; color: #FFD700; }
        .discounts-list { list-style: none; padding: 0; }
        .discounts-list li { padding: 5px 0; padding-left: 20px; position: relative; }
        .discounts-list li:before { content: '✓'; position: absolute; left: 0; color: #2f6f30; }
    </style>
</head>
<body>
    <div class='container'>
        <h2>📋 Новая активация гарантийного талона</h2>
        
        <div class='section'>
            <h3>1. Идентификация</h3>
            <div class='field'><strong>Телефон:</strong> " . ($phone ?: 'Не указан') . "</div>
            <div class='field'><strong>Номер договора:</strong> " . ($contract ?: 'Не указан') . "</div>
        </div>
        
        <div class='section'>
            <h3>2. Дополнительные работы</h3>
            <div class='field'><strong>Были дополнительные работы:</strong> " . ($additional_work ?: 'Не указано') . "</div>";

if ($additional_work === 'Да' && !empty($work_descriptions)) {
    $message .= "<div class='field'><strong>Список работ:</strong><ul>";
    foreach ($work_descriptions as $index => $desc) {
        $cost = isset($work_costs[$index]) ? $work_costs[$index] : 'Не указана';
        if (!empty($desc)) {
            $message .= "<li>" . htmlspecialchars($desc) . " - <strong>" . htmlspecialchars($cost) . " руб.</strong></li>";
        }
    }
    $message .= "</ul></div>";
}

$message .= "
        </div>
        
        <div class='section'>
            <h3>3. Оценка работы продавцов</h3>
            <div class='field'><strong>Рейтинг:</strong> <span class='rating'>" . str_repeat('★', $sales_rating) . str_repeat('☆', 5 - $sales_rating) . "</span> (" . $sales_rating . "/5)</div>";

if (!empty($sales_feedback_bad)) {
    $message .= "<div class='field'><strong>Комментарий:</strong> " . nl2br($sales_feedback_bad) . "</div>";
}

$message .= "
        </div>
        
        <div class='section'>
            <h3>4. Оценка работы доставки</h3>
            <div class='field'><strong>Рейтинг:</strong> <span class='rating'>" . str_repeat('★', $delivery_rating) . str_repeat('☆', 5 - $delivery_rating) . "</span> (" . $delivery_rating . "/5)</div>";

if (!empty($delivery_feedback_bad)) {
    $message .= "<div class='field'><strong>Комментарий:</strong> " . nl2br($delivery_feedback_bad) . "</div>";
}

$message .= "
        </div>
        
        <div class='section'>
            <h3>5. Оценка работы монтажников</h3>
            <div class='field'><strong>Рейтинг:</strong> <span class='rating'>" . str_repeat('★', $installation_rating) . str_repeat('☆', 5 - $installation_rating) . "</span> (" . $installation_rating . "/5)</div>";

if (!empty($installation_feedback_bad)) {
    $message .= "<div class='field'><strong>Комментарий:</strong> " . nl2br($installation_feedback_bad) . "</div>";
}

$message .= "
        </div>
        
        <div class='section'>
            <h3>6. Забронированные скидки</h3>";

if (!empty($discounts)) {
    $message .= "<ul class='discounts-list'>";
    foreach ($discounts as $discount) {
        $message .= "<li>" . htmlspecialchars($discount) . "</li>";
    }
    $message .= "</ul>";
} else {
    $message .= "<div class='field'>Скидки не выбраны</div>";
}

$message .= "
        </div>
        
        <div class='section'>
            <h3>Согласие на обработку данных</h3>
            <div class='field'><strong>Статус:</strong> " . $consent . "</div>
        </div>
        
        <div style='margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 8px; font-size: 12px; color: #666;'>
            <strong>Дата и время:</strong> " . date('d.m.Y H:i:s') . "<br>
            <strong>IP-адрес:</strong> " . $_SERVER['REMOTE_ADDR'] . "
        </div>
    </div>
</body>
</html>
";

// Заголовки для HTML письма
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Форма гарантии <noreply@yourdomain.com>" . "\r\n";
$headers .= "Reply-To: " . ($phone ?: 'noreply@yourdomain.com') . "\r\n";

// Функция отправки данных в Google Sheets
function sendToGoogleSheets($url, $data) {
    if (empty($url) || $url === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
        return false;
    }
    
    // Попытка использовать cURL (более надёжный метод)
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen(json_encode($data))
        ));
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Не следовать за редиректами
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1); // Использовать HTTP/1.1
        
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        // Логирование для отладки (можно удалить после настройки)
        error_log("Google Sheets Response: " . $result);
        error_log("HTTP Code: " . $httpCode);
        if ($error) {
            error_log("CURL Error: " . $error);
        }
        
        // Google Apps Script возвращает 302 при успешной отправке
        return ($httpCode == 200 || $httpCode == 302);
    }
    
    // Альтернативный метод через file_get_contents
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data),
            'timeout' => 30,
            'follow_location' => 1
        )
    );
    
    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    // Логирование
    if ($result === false) {
        error_log("Google Sheets file_get_contents failed");
    } else {
        error_log("Google Sheets Response (file_get_contents): " . $result);
    }
    
    return $result !== false;
}

// Функция отправки сообщения в Telegram
function sendTelegramNotification($bot_token, $chat_id, $message) {
    $url = "https://api.telegram.org/bot" . $bot_token . "/sendMessage";
    
    $data = array(
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML'
    );
    
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data)
        )
    );
    
    $context  = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    return $result !== false;
}

// Формирование текстового сообщения для Telegram
$telegram_message = "🔔 <b>Новая активация гарантийного талона</b>\n\n";
$telegram_message .= "📋 <b>1. Идентификация</b>\n";
$telegram_message .= "📞 Телефон: " . ($phone ?: 'Не указан') . "\n";
$telegram_message .= "📄 Договор: " . ($contract ?: 'Не указан') . "\n\n";

$telegram_message .= "🛠 <b>2. Дополнительные работы</b>\n";
$telegram_message .= "Ответ: " . ($additional_work ?: 'Не указано') . "\n";

if ($additional_work === 'Да' && !empty($work_descriptions)) {
    $telegram_message .= "Список работ:\n";
    foreach ($work_descriptions as $index => $desc) {
        $cost = isset($work_costs[$index]) ? $work_costs[$index] : 'Не указана';
        if (!empty($desc)) {
            $telegram_message .= "• " . strip_tags($desc) . " - " . strip_tags($cost) . " руб.\n";
        }
    }
}
$telegram_message .= "\n";

$telegram_message .= "⭐️ <b>3. Оценка продавцов</b>\n";
$telegram_message .= "Рейтинг: " . str_repeat('⭐️', $sales_rating) . " (" . $sales_rating . "/5)\n";
if (!empty($sales_feedback_bad)) {
    $telegram_message .= "Комментарий: " . strip_tags($sales_feedback_bad) . "\n";
}
$telegram_message .= "\n";

$telegram_message .= "🚚 <b>4. Оценка доставки</b>\n";
$telegram_message .= "Рейтинг: " . str_repeat('⭐️', $delivery_rating) . " (" . $delivery_rating . "/5)\n";
if (!empty($delivery_feedback_bad)) {
    $telegram_message .= "Комментарий: " . strip_tags($delivery_feedback_bad) . "\n";
}
$telegram_message .= "\n";

$telegram_message .= "🔨 <b>5. Оценка монтажников</b>\n";
$telegram_message .= "Рейтинг: " . str_repeat('⭐️', $installation_rating) . " (" . $installation_rating . "/5)\n";
if (!empty($installation_feedback_bad)) {
    $telegram_message .= "Комментарий: " . strip_tags($installation_feedback_bad) . "\n";
}
$telegram_message .= "\n";

$telegram_message .= "🎁 <b>6. Забронированные скидки</b>\n";
if (!empty($discounts)) {
    foreach ($discounts as $discount) {
        $telegram_message .= "✓ " . strip_tags($discount) . "\n";
    }
} else {
    $telegram_message .= "Скидки не выбраны\n";
}
$telegram_message .= "\n";

$telegram_message .= "📅 Дата: " . date('d.m.Y H:i:s') . "\n";
$telegram_message .= "🌐 IP: " . $_SERVER['REMOTE_ADDR'];

// Подготовка данных для Google Sheets
$sheets_data = array(
    'timestamp' => date('d.m.Y H:i:s'),
    'phone' => str_replace('+', '', $phone), // Убираем + чтобы избежать ошибки формулы в Google Sheets
    'contract' => $contract,
    'additional_work' => $additional_work,
    'work_descriptions' => !empty($work_descriptions) ? implode('; ', array_filter($work_descriptions)) : '',
    'work_costs' => !empty($work_costs) ? implode('; ', array_filter($work_costs)) : '',
    'sales_rating' => $sales_rating,
    'sales_feedback' => $sales_feedback_bad,
    'delivery_rating' => $delivery_rating,
    'delivery_feedback' => $delivery_feedback_bad,
    'installation_rating' => $installation_rating,
    'installation_feedback' => $installation_feedback_bad,
    'discounts' => !empty($discounts) ? implode(', ', $discounts) : '',
    'ip_address' => $_SERVER['REMOTE_ADDR']
);

// Отправка в Google Sheets
$sheets_sent = sendToGoogleSheets($google_sheets_url, $sheets_data);

// Отправка уведомления в Telegram (если настроены параметры)
$telegram_sent = false;
if ($telegram_bot_token !== "YOUR_BOT_TOKEN_HERE" && $telegram_chat_id !== "YOUR_CHAT_ID_HERE") {
    $telegram_sent = sendTelegramNotification($telegram_bot_token, $telegram_chat_id, $telegram_message);
}

// Отправка письма
$email_sent = mail($to_email, $subject, $message, $headers);

if ($email_sent || $telegram_sent || $sheets_sent) {
    // Успешная отправка хотя бы одним способом
    $response_message = 'Гарантия успешно активирована!';
    $notifications = array();
    
    if ($email_sent) {
        $notifications[] = 'почту';
    }
    if ($telegram_sent) {
        $notifications[] = 'Telegram';
    }
    if ($sheets_sent) {
        $notifications[] = 'Google Таблицы';
    }
    
    if (!empty($notifications)) {
        $response_message .= ' Данные сохранены: ' . implode(', ', $notifications) . '.';
    }
    
    echo json_encode([
        'success' => true,
        'message' => $response_message
    ]);
} else {
    // Ошибка отправки
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при отправке уведомлений. Попробуйте позже.'
    ]);
}
?>
