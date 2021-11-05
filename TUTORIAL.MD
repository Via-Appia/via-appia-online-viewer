# Tutorial

## Opzetten wekomgeving

* **Visual Studio Code**
* **Node JS**
* **Git**
* **Github**
* **Yarn**

### Github en Git Installeren

Nadat je een account hebt aangemaakt bij Github moet je er nog voor zorgen dat je met Git connectie kan maken naar Github, hiervoor wordt gebruik gemaakt van een *ssh-connenctie*.
Dit is een versleutelde verbinding, zonder passwords, maar met een 'secret-key-pair'. Hiervoor genereren we éénmalig een sleutelpaar: public-key en private-key; Die private-key is geheim, die mag je nooit weggeven of aan iemand laten zien! De public-key kan je wel weggeven, die installeren we dus op Github. Vervolgens kunnen we automatisch met Git verbinding maken met Github.

Stappen met links naar Github handleiding:

* [Check of er al een ssh key pair aanwezig is op je computer.](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys) 
* [Zo niet, dan genereren we die.](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
* [Opload de public key naar Github.](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [Test met de ssh verbinding met Github.](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection)

> Voor de meeste handelingen maak je gebruik van Git Bash. Als je Git hebt geinstalleerd, dan start je Git Bash vanuit je conext-menu in Windows: Met je muis op je desktop, rechtermuis-button, dan klik je **`Git Bash Here`**, dit opent een terminal gelijkend aan Windows-CMD of Powershell.

> Enkele basic commands in Git Bash:
>* `ls -la` -> geeft een lijst van alle bestanden/folders in de huidige directory
>* `cd foldernaam` -> verdanderd van folder
>* `code .` -> Opend VS Code in deze folder, heel handig!
>* `cd ~` -> Dit is een shortcut naar je Home folder.
>* `cd fol` en dan **Tab**, dit maakt de foldernaam af als dit in de folder aanwezig is.
>* cursor omhoog/omlaag, hiermee ga je door je eerder ingetikte commando's

### Yarn

Yarn is een alternatief voor NPM, sommige vinden Yarn net iets prettiger werken.

#### Install Yarn

* In Git Bash type: `npm install --global yarn`

### Werken met Git/Github en VS Code

* Werken vanuit VS Code
* Repository Clonen
* Installeren van Node Packages
* Starten van de App
* Updaten van je aanpassingen naar Github


