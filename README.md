# This repository is deprecated
We're moving onto [VTuber-Academy/Amari](https://github.com/VTuber-Academy/Amari)!

# VTA Discord Bot

Public Repository that contains the source code of the VTA Bot running in the [VTuber Academy Discord](https://discord.gg/vta)

## Installation

Requires Node version 16.9.0 or higher

```bash
npm install
```

Create a .env file in the project root folder

```env
# Development Purposes Only
TOKEN="<Application Token>"
CLIENTID="<Application Client ID>"

# For Development Guild
GUILDID="<Guild ID>"
VTUBERROLE="<VTUBER ROLE ID>"
APPLICATIONCHANNEL="<APPLICATION CHANNEL ID>"

# For Applications
DBCONNECTIONSTRING="<MongoDB Connection String>"
```

## Usage

Run the app from the project root folder
```bash
node .
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
