
import { SlashCommandBuilder } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { addMoney } from '../../utils/economy.js';
import { isBotOwner } from '../../config/bot.js';
import { withErrorHandling, createError, ErrorTypes } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give yourself coins (bot owner only)')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of coins to give yourself')
                .setRequired(true)
                .setMinValue(1)
        ),

    execute: withErrorHandling(async (interaction, config, client) => {
        if (!isBotOwner(interaction.user.id)) {
            throw createError(
                'Unauthorized',
                ErrorTypes.PERMISSION,
                'Only the bot owner can use this command.'
            );
        }

        const deferred = await InteractionHelper.safeDefer(interaction);
        if (!deferred) return;

        const amount = interaction.options.getInteger('amount');
        const guildId = interaction.guildId;

        if (!guildId) {
            throw createError(
                'Missing server',
                ErrorTypes.VALIDATION,
                'This command must be used inside a server.'
            );
        }

        const result = await addMoney(
            client,
            guildId,
            interaction.user.id,
            amount,
            'wallet'
        );

        const embed = successEmbed(
            'Money Added!',
            `You added **$${amount.toLocaleString()}** to your wallet!\n\nNew balance: **$${result.newBalance.toLocaleString()}**`
        );

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [embed]
        });
    }, { command: 'give' })
};
