// НАСТРОЙКИ ДЛЯ ОБЖАЛОВАНИЙ БАНОВ
const BOT_WEBHOOK_URL = "https://discord-bot-production-147e.up.railway.app/webhook/ban-appeal"; // URL вашего бота
const DISCORD_MENTIONS = "<@&1389983287589732352> <@&1389984050160074762>"; // Упоминания ролей администрации
const EMBED_COLOR = 16753920; // Оранжевый цвет (для обжалований)
const EMBED_TITLE = "🔓 Новое обжалование бана"; // Заголовок
const EMBED_DESCRIPTION = ""; // Описание (можно оставить пустым)
const EMBED_FOOTER = "Система обжалований"; // Текст внизу

// НАЗВАНИЕ ПОЛЯ С DISCORD НИКОМ (точное название из Google Forms)
const DISCORD_FIELD_NAME = "Ваш дискорд:"; // Точное название поля из формы

// ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ
NUMBER_QUESTION = false;
CHECKBOX_STROKE = false;
CHECKBOX_SEPARATION = "\n ";
GRID_STROKE = false;
GRID_SEPARATION = "\n ";
MULTIPLE_CHOICE_STROKE = false;
MULTIPLE_CHOICE_SEPARATION = "\n ";

// ================================================================================================================ //

function onSubmit(e) {
    const response = e.response.getItemResponses();
    let fields = [];
    var num = 1;

    for (const responseAnswer of response) {
        const question = responseAnswer.getItem().getTitle();
        let answer = responseAnswer.getResponse();

        // Обработка различных типов вопросов
        switch (responseAnswer.getItem().getType()) {
            case FormApp.ItemType.CHECKBOX:
            case FormApp.ItemType.CHECKBOX_GRID:
                if (Array.isArray(answer)) { 
                    if (CHECKBOX_STROKE) {
                        answer = answer.map(choice => `\`${choice}\``).join(CHECKBOX_SEPARATION);
                    } else {
                        answer = answer.join(CHECKBOX_SEPARATION);
                    }
                }
                break;
            case FormApp.ItemType.GRID:
                const gridItem = responseAnswer.getItem().asGridItem();
                const rows = gridItem.getRows();

                if (Array.isArray(answer)) {
                    if (GRID_STROKE) {
                        answer = answer.map((selectedChoice, index) => `\`${rows[index]}: ${selectedChoice}\``).join(GRID_SEPARATION);
                    } else {
                        answer = answer.map((selectedChoice, index) => `${rows[index]}: ${selectedChoice}`).join(GRID_SEPARATION);
                    }
                }
                break;
            case FormApp.ItemType.MULTIPLE_CHOICE:
                if (Array.isArray(answer)) {
                    if (MULTIPLE_CHOICE_STROKE) {
                        answer = answer.map(choice => `\`${choice}\``).join(MULTIPLE_CHOICE_SEPARATION);
                    } else {
                        answer = answer.join(MULTIPLE_CHOICE_SEPARATION);
                    }
                }
                break;
        }

        if (!answer) {
            continue;
        }

        if (NUMBER_QUESTION) {
            fields.push({
                "name": `${num}. ${question}`,
                "value": answer,
                "inline": false
            });
        } else {
            fields.push({
                "name": question,
                "value": answer,
                "inline": false
            });
        }
        num += 1
    }

    // Отправляем данные на бота
    var options = {
        "method": "post",
        "headers": {
            "Content-Type": "application/json",
        },
        "payload": JSON.stringify({
            "content": DISCORD_MENTIONS,
            "title": EMBED_TITLE,
            "description": EMBED_DESCRIPTION,
            "color": EMBED_COLOR,
            "fields": fields,
            "footer": EMBED_FOOTER
        })
    };

    try {
        UrlFetchApp.fetch(BOT_WEBHOOK_URL, options);
    } catch (error) {
        Logger.log('Ошибка при отправке обжалования: ' + error);
    }
}
