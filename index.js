// index.js
const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder, 
  SlashCommandBuilder, 
  Routes, 
  REST,
  InteractionType
} = require('discord.js');

const TOKEN = "MTQ3Nzg4MjIyNzQ5OTk5MTE1MQ.GxLGkZ.8xBIYTjobv7wjt_hR51DaMXhvhsCicl0tbfv_k";
const CLIENT_ID = "1477882227499991151";
const GUILD_ID = "1475505308704051262";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers // <- konieczne żeby widzieć role
  ]
});

// Rejestracja slash command
const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Wyświetla panel plakietek')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Zarejestrowano slash command /panel');
  } catch (err) {
    console.error(err);
  }
})();

// Po zalogowaniu
client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}`);
});

// Obsługa interakcji
client.on('interactionCreate', async interaction => {
  // Slash command
  if (interaction.type === InteractionType.ApplicationCommand && interaction.commandName === 'panel') {
    const embed = new EmbedBuilder()
      .setTitle("📛 Panel Plakietek - Hog's Pub")
      .setDescription("Kliknij przycisk poniżej, aby wygenerować swoją plakietkę.")
      .setColor(0xF1C40F);

    const button = new ButtonBuilder()
      .setCustomId('generuj')
      .setLabel('Generuj plakietkę')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
  }

  // Button
  if (interaction.isButton() && interaction.customId === 'generuj') {
    // Pobranie pełnego członka serwera
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const roles = member.roles.cache;

    let ranga = null;

    // Sprawdzenie rangi
    const roleNames = ["Praktykant","Młodszy Barista","Barista","Starszy Barista","Właściciel","Szef","Manager","Kierownik"];
    for (const rn of roleNames) {
      if (roles.some(r => r.name === rn)) {
        ranga = rn;
        break;
      }
    }

    if (!ranga) {
      return interaction.reply({ content: "❌ Nie masz odpowiedniej rangi.", flags: 64 });
    }

    const nick = member.displayName;
    const tekst = `/opis <b> ~y~ Hog's Pub <br> ~w~ ${nick} <br> ~w~ [${ranga}-ODZNAKA]`;

    await interaction.reply({ content: "📛 Twoja plakietka:\n```" + tekst + "```", flags: 64 });
  }
});

// Logowanie
client.login(TOKEN);