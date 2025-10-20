const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const staffDB = require('./staff-database');

// Обработчики кнопок панели управления персоналом
async function handleStaffButton(interaction) {
  const customId = interaction.customId;

  // Нанять сотрудника
  if (customId === 'staff_hire') {
    const modal = new ModalBuilder()
      .setCustomId('staff_hire_modal')
      .setTitle('Нанять сотрудника');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник (без #0000)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const minecraftInput = new TextInputBuilder()
      .setCustomId('minecraft_nick')
      .setLabel('Minecraft ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Steve123')
      .setRequired(true);

    const positionInput = new TextInputBuilder()
      .setCustomId('position')
      .setLabel('Должность')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('HELPER, MODER, ADMIN и т.д.')
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);
    const row2 = new ActionRowBuilder().addComponents(minecraftInput);
    const row3 = new ActionRowBuilder().addComponents(positionInput);

    modal.addComponents(row1, row2, row3);
    await interaction.showModal(modal);
    return;
  }

  // Уволить сотрудника
  if (customId === 'staff_fire') {
    const modal = new ModalBuilder()
      .setCustomId('staff_fire_modal')
      .setTitle('Уволить сотрудника');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Причина увольнения')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);
    const row2 = new ActionRowBuilder().addComponents(reasonInput);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
    return;
  }

  // Повысить
  if (customId === 'staff_promote') {
    const modal = new ModalBuilder()
      .setCustomId('staff_promote_modal')
      .setTitle('Повысить сотрудника');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const newPositionInput = new TextInputBuilder()
      .setCustomId('new_position')
      .setLabel('Новая должность')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);
    const row2 = new ActionRowBuilder().addComponents(newPositionInput);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
    return;
  }

  // Понизить
  if (customId === 'staff_demote') {
    const modal = new ModalBuilder()
      .setCustomId('staff_demote_modal')
      .setTitle('Понизить сотрудника');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const newPositionInput = new TextInputBuilder()
      .setCustomId('new_position')
      .setLabel('Новая должность')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);
    const row2 = new ActionRowBuilder().addComponents(newPositionInput);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
    return;
  }

  // Выдать варн
  if (customId === 'staff_warn') {
    const modal = new ModalBuilder()
      .setCustomId('staff_warn_modal')
      .setTitle('Выдать варн');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Причина варна')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);
    const row2 = new ActionRowBuilder().addComponents(reasonInput);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
    return;
  }

  // Снять варн
  if (customId === 'staff_unwarn') {
    const modal = new ModalBuilder()
      .setCustomId('staff_unwarn_modal')
      .setTitle('Снять варн');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);

    modal.addComponents(row1);
    await interaction.showModal(modal);
    return;
  }

  // ЧСП (Черный список проекта)
  if (customId === 'staff_blacklist') {
    const modal = new ModalBuilder()
      .setCustomId('staff_blacklist_modal')
      .setTitle('Добавить в ЧСП');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Причина добавления в ЧСП')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);
    const row2 = new ActionRowBuilder().addComponents(reasonInput);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
    return;
  }

  // Отправить в отпуск
  if (customId === 'staff_vacation_add') {
    const modal = new ModalBuilder()
      .setCustomId('staff_vacation_add_modal')
      .setTitle('Отправить в отпуск');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);

    modal.addComponents(row1);
    await interaction.showModal(modal);
    return;
  }

  // Вернуть из отпуска
  if (customId === 'staff_vacation_remove') {
    const modal = new ModalBuilder()
      .setCustomId('staff_vacation_remove_modal')
      .setTitle('Вернуть из отпуска');

    const discordInput = new TextInputBuilder()
      .setCustomId('discord_username')
      .setLabel('Discord ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('username')
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(discordInput);

    modal.addComponents(row1);
    await interaction.showModal(modal);
    return;
  }

  // Список персонала
  if (customId === 'staff_list') {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const allStaff = await staffDB.getAllStaff();

    if (allStaff.length === 0) {
      await interaction.editReply({
        content: '📋 База данных персонала пуста'
      });
      return;
    }

    const staffList = allStaff
      .filter(staff => staff.status === 'Активен')
      .map((staff, index) => 
        `**${index + 1}. ${staff.discord}**\n` +
        `└ 🎮 Minecraft: ${staff.minecraft}\n` +
        `└ 🎖️ Должность: ${staff.position}\n` +
        `└ ⚠️ Варны: ${staff.warns}/3\n` +
        `└ 📅 Дата найма: ${staff.hireDate}`
      )
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('📋 Список персонала')
      .setDescription(staffList || 'Нет активного персонала')
      .setColor(0x5865F2)
      .setTimestamp()
      .setFooter({ text: `Всего сотрудников: ${allStaff.filter(s => s.status === 'Активен').length}` });

    await interaction.editReply({ embeds: [embed] });
  }
}

// Обработчики модальных окон
async function handleStaffModal(interaction) {
  const customId = interaction.customId;

  // Нанять
  if (customId === 'staff_hire_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');
    const minecraftNick = interaction.fields.getTextInputValue('minecraft_nick');
    const position = interaction.fields.getTextInputValue('position');

    const success = await staffDB.addStaff(discordUsername, minecraftNick, position);

    if (success) {
      await interaction.reply({
        content: `✅ Сотрудник **${discordUsername}** (Minecraft: **${minecraftNick}**) нанят на должность **${position}**`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при найме сотрудника`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Уволить
  if (customId === 'staff_fire_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');
    const reason = interaction.fields.getTextInputValue('reason');

    const success = await staffDB.removeStaff(discordUsername);

    if (success) {
      await interaction.reply({
        content: `✅ Сотрудник **${discordUsername}** уволен\nПричина: ${reason}`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при увольнении сотрудника`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Повысить
  if (customId === 'staff_promote_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');
    const newPosition = interaction.fields.getTextInputValue('new_position');

    const success = await staffDB.updatePosition(discordUsername, newPosition);

    if (success) {
      await interaction.reply({
        content: `✅ Сотрудник **${discordUsername}** повышен до **${newPosition}**`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при повышении сотрудника`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Понизить
  if (customId === 'staff_demote_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');
    const newPosition = interaction.fields.getTextInputValue('new_position');

    const success = await staffDB.updatePosition(discordUsername, newPosition);

    if (success) {
      await interaction.reply({
        content: `✅ Сотрудник **${discordUsername}** понижен до **${newPosition}**`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при понижении сотрудника`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Выдать варн
  if (customId === 'staff_warn_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');
    const reason = interaction.fields.getTextInputValue('reason');

    const success = await staffDB.addWarn(discordUsername);

    if (success) {
      const staff = await staffDB.findStaff(discordUsername);
      await interaction.reply({
        content: `⚠️ Сотруднику **${discordUsername}** выдан варн (${staff.warns}/3)\nПричина: ${reason}`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при выдаче варна`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Снять варн
  if (customId === 'staff_unwarn_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');

    const success = await staffDB.removeWarn(discordUsername);

    if (success) {
      const staff = await staffDB.findStaff(discordUsername);
      await interaction.reply({
        content: `✅ У сотрудника **${discordUsername}** снят варн (${staff.warns}/3)`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при снятии варна или у сотрудника нет варнов`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // ЧСП (Черный список проекта)
  if (customId === 'staff_blacklist_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');
    const reason = interaction.fields.getTextInputValue('reason');

    const success = await staffDB.updateStatus(discordUsername, 'ЧСП');

    if (success) {
      await interaction.reply({
        content: `🚫 Сотрудник **${discordUsername}** добавлен в ЧСП (Черный список проекта)\nПричина: ${reason}`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при добавлении в ЧСП`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Отправить в отпуск
  if (customId === 'staff_vacation_add_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');

    const success = await staffDB.setVacation(discordUsername, true);

    if (success) {
      await interaction.reply({
        content: `🏖️ Сотрудник **${discordUsername}** отправлен в отпуск`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при отправке в отпуск`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Вернуть из отпуска
  if (customId === 'staff_vacation_remove_modal') {
    const discordUsername = interaction.fields.getTextInputValue('discord_username');

    const success = await staffDB.setVacation(discordUsername, false);

    if (success) {
      await interaction.reply({
        content: `💼 Сотрудник **${discordUsername}** вернулся из отпуска`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при возврате из отпуска`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
}

module.exports = { handleStaffButton, handleStaffModal };
