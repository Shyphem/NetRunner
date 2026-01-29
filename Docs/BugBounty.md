#### ======================================

#### BUG BOUNTY WORKFLOW - RECON \& ANALYSIS

#### ======================================

#### 

#### Note : Toujours respecter le scope (périmètre) du programme de Bug Bounty.

#### 

#### ---

#### 1\. Reconnaissance de Sous-domaines (Enumeration)

#### ---

#### Objectif : Trouver tous les points d'entrée possibles.

#### 

#### \# WAF \& CMS:

#### wafw00f https://target.com

#### python3 cmseek.py -u target.com

#### 

#### 

#### 

#### \# 1. Subfinder (Rapide et efficace)

#### subfinder -d target.com -all -v -o sub\_subfinder.txt

#### 

#### \# 2. Amass (Plus lent, mais très complet)

#### amass enum -passive -d target.com -o sub\_amass.txt

#### 

#### \# 3. Assetfinder (Bon complément)

#### assetfinder --subs-only target.com >> sub\_asset.txt

#### 

#### \# 4. Chaos (ProjectDiscovery)

#### chaos -d target.com -o sub\_chaos.txt

#### 

#### \# 5. Sublist3r (Un classique)

#### sublist3r -d target.com -o sub\_sublist3r.txt

#### 

#### \# Nettoyage et Consolidation :

#### cat sub\_\*.txt > all\_subs\_raw.txt

#### sort all\_subs\_raw.txt | uniq > all\_subs\_unique.txt

#### 

#### \# Vérifier le nombre

#### cat all\_subs\_unique.txt | wc -l

#### 

#### ---

#### 2\. Filtrage \& HTTP Probing (Live Check)

#### ---

#### Objectif : Ne travailler que sur ce qui répond.

#### 

#### \# Vérifier les domaines "live" + infos

#### cat all\_subs\_unique.txt | httpx-toolkit -sc -title -server -tech-detect -o live\_subs\_detailed.txt

#### 

#### \# Créer une liste simple des URLs "live"

#### cat live\_subs\_detailed.txt | awk '{print $1}' > live\_subs\_urls.txt

#### 

#### \# Subdomain Takeover Check (Rapide)

#### subzy run --targets all\_subs\_unique.txt

#### 

#### ---

#### 3\. Port Scanning

#### ---

#### Objectif : Trouver des services non-Web.

#### 

#### \# Scan rapide

#### masscan -p1-65535 --rate 10000 -iL all\_subs\_unique.txt -oG masscan\_results.txt

#### 

#### \# Scan précis Nmap

#### nmap -sC -sV -p- --open -iL live\_subs\_urls.txt -oN nmap\_results.txt

#### 

#### ---

#### 4\. Content Discovery (Crawling \& Archives)

#### ---

#### Objectif : Trouver des URLs, endpoints et fichiers.

#### 

#### \# GAU (Get All Urls)

#### gau target.com | tee urls\_gau.txt

#### 

#### \# Waybackurls

#### waybackurls target.com > urls\_wayback.txt

#### 

#### \# Katana (Moteur moderne)

#### katana -list live\_subs\_urls.txt -jc -kf -d 5 -ps -pss waybackarchive,commoncrawl,alienvault -o urls\_katana.txt

#### 

#### \# Fusionner toutes les URLs trouvées

#### cat urls\_\*.txt | sort | uniq > all\_urls\_global.txt

#### 

#### \# Extraction de fichiers sensibles (Grepping)

#### cat all\_urls\_global.txt | grep -E "\\.txt|\\.log|\\.cache|\\.secret|\\.db|\\.backup\\.yml|\\.json|\\.gz|\\.rar|\\.zip|\\.config" > interesting\_files.txt

#### 

#### \# Isoler les fichiers Javascript

#### cat all\_urls\_global.txt | grep ".js$" > js\_files.txt

#### 

#### ---

#### 5\. Directory Fuzzing \& Bypass

#### ---

#### Objectif : Trouver des dossiers cachés (Admin, API, etc.).

#### 

#### \# FFUF (Standard)

#### ffuf -u https://target.com/FUZZ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -mc 200,403 -o ffuf\_results.txt

#### 

#### \# Dirsearch (Avec une liste d'extensions massive)

#### dirsearch -u https://target.com -e php,cgi,htm,html,js,txt,bak,zip,old,conf,log,sql,json,xml,yaml,env -t 20 --exclude-status 404 --random-agent

#### 

#### \# 403 Bypass (Si un dossier admin répond 403 Forbidden)

#### ./403-bypass.sh -u https://target.com/admin

#### 

#### ---

#### 6\. Javascript Analysis

#### ---

#### Objectif : Trouver des clés API, des endpoints cachés et des secrets.

#### 

#### \# Analyse statique des liens

#### python3 linkfinder.py -i https://target.com/script.js -o results.html

#### 

#### \# Scan de vulnérabilités dans les JS avec Nuclei

#### cat js\_files.txt | nuclei -t /nuclei-templates/http/exposures/ -severity critical,high,medium

#### 

#### \# Extraction de secrets avec GF (Grep Friendly)

#### cat js\_files.txt | gf apikeys > secrets\_found.txt

#### 

#### ---

#### 7\. Parameters Discovery \& Vulnerability Scanning

#### ---

#### Objectif : Trouver les points d'injection.

#### 

#### \# Découverte de paramètres :

#### python3 paramspider.py -d target.com --level high -o params\_spider.txt

#### arjun -u https://target.com/api -m GET -o params\_arjun.json

#### 

#### \# Automation avec GF et Nuclei (Workflow Moderne) :

#### 

#### \# XSS

#### cat all\_urls\_global.txt | gf xss | dalfox pipe -o xss\_verified.txt

#### 

#### \# LFI

#### cat all\_urls\_global.txt | gf lfi | nuclei -tags lfi -o lfi\_results.txt

#### 

#### \# SSRF

#### cat all\_urls\_global.txt | gf ssrf | nuclei -tags ssrf -o ssrf\_results.txt

#### 

#### \# SQL Injection

#### cat all\_urls\_global.txt | gf sqli | sqlmap --batch --random-agent --level 1

#### 

#### ---

#### 8\. Specific Checks (Git, API)

#### ---

#### 

#### \# Git Recon:

#### python3 GitDorker.py -d Dorks/medium\_dorks.txt -tf tokens.txt -q target.com

#### python3 GitDumper.py https://target.com/.git /output-folder/

#### 

#### \# Bypass 403 Forbidden pages : 

git clone https://github.com/Dheerajmadhukar/4-ZERO-3.git
./403-bypass.sh -u https://exemple.com/test/ --exploit
---



