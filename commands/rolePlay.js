import { SlashCommandBuilder } from "@discordjs/builders";
import asUser from "../utils/asUser.js";

export default {
    data: new SlashCommandBuilder()
        .setName("roleplay")
        .setDescription("Send a message as a character")
        .addStringOption(option => option
            .setName("content")
            .setDescription("The content of your character's message")
            .setRequired(true)
        ),
    execute: async function(interaction) {
        let userID = interaction.member.id;
        let character = await global.DB.db("Info").collection("Guilds").findOne({ id: interaction.guild.id, "characters.userID": userID });

        if(!character) {
            interaction.reply({ content: "You have not created a character yet", ephemeral: true });
            return;
        }
        
        let channel = (await global.DB.db("Info").collection("Guilds").findOne({ id: interaction.guild.id, "channels.channelID": interaction.channel.id })).channels.filter(v => v.channelID == interaction.channel.id)[0];

        if(!channel) {
            interaction.reply({ content: "This channel has not been set up for roleplay", ephemeral: true });
            return;
        } else if(channel.last === userID) {
            interaction.reply({ content: "You just posted", ephemeral: true });
            return;
        } else if(channel.type === 2) {
            interaction.reply({ content: "This is a narrator only channel", ephemeral: true });
            return;
        }

        asUser(interaction.channel, character.characters.filter(v => v.userID == userID)[0], { content: interaction.options.getString("content") });
        interaction.reply({ content: "Message sent", ephemeral: true });

        global.DB.db("Info").collection("Guilds").updateOne({ id: interaction.guild.id, "channels.channelID": interaction.channel.id }, { $set: { "channels.$.last": userID }});
    }
}