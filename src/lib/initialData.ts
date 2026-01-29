import { type Node, type Edge } from 'reactflow';

// Dynamically import all markdown files from the knowledge_base
// const modules = import.meta.glob('/src/assets/knowledge_base/*.md', { as: 'raw', eager: true });

export const generateReconTree = (domain: string): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const addNode = (id: string, label: string, category: string, command: string, description: string, x: number, y: number, parentId?: string) => {
        nodes.push({
            id,
            type: 'custom',
            position: { x, y },
            data: { label, category, command, content: description }
        });
        if (parentId) {
            edges.push({
                id: `e-${parentId}-${id}`,
                source: parentId,
                target: id,
                animated: true,
                style: { stroke: getCategoryColor(category), strokeWidth: 2 },
            });
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Passive Enum': return '#3b82f6'; // Blue
            case 'Active Enum': return '#ef4444'; // Red
            case 'Probing': return '#f97316'; // Orange
            case 'Port Scanning': return '#10b981'; // Green
            case 'Fingerprinting': return '#a855f7'; // Purple
            case 'Visual Recon': return '#ec4899'; // Pink
            case 'Content Discovery': return '#eab308'; // Yellow
            case 'URL Extraction': return '#06b6d4'; // Cyan
            case 'Vulnerability Filtering': return '#f43f5e'; // Rose
            default: return '#64748b';
        }
    };

    // Root
    const rootX = 1500;
    addNode('recon', 'Reconnaissance', 'Root', '', '', rootX, 0);

    // Branch A: Subdomain Enumeration
    const enumY = 200;
    addNode('sub-enum', 'Subdomain Enumeration', 'Passive Enum', '', '', rootX, enumY, 'recon');

    // Passive Branch (Far Left)
    const passiveGroupX = 600; // Center of passive group
    const passiveY = 450;
    addNode('passive', 'Passive Enum', 'Passive Enum', '', '', passiveGroupX, passiveY, 'sub-enum');

    // Passive Tools - Distributed horizontally with 300px spacing
    // Range: 0 to 1200
    addNode('subfinder', 'Subfinder', 'Passive Enum', `subfinder -d ${domain} -all -silent -o subfinder-subs.txt`, '', 0, passiveY + 250, 'passive');
    addNode('assetfinder', 'Assetfinder', 'Passive Enum', `assetfinder -subs-only ${domain} | tee assetfinder_subs.txt`, '', 300, passiveY + 250, 'passive');
    addNode('findomain', 'Findomain', 'Passive Enum', `findomain --quiet -t ${domain} | tee findomain-subs.txt`, '', 600, passiveY + 250, 'passive');
    addNode('sublist3r', 'Sublist3r', 'Passive Enum', `sublist3r -d ${domain} -t 50 -o sublist3r.txt`, '', 900, passiveY + 250, 'passive');
    addNode('amass', 'Amass', 'Passive Enum', `amass enum -passive -d ${domain} -o amass_passive.txt`, '', 1200, passiveY + 250, 'passive');

    // Active Branch (Far Right)
    const activeGroupX = 2400; // Center of active group
    const activeY = 450;
    addNode('active', 'Active Enum', 'Active Enum', '', '', activeGroupX, activeY, 'sub-enum');

    // Active Tools - Starting from 1800 to ensure >600px gap from Amass(1200)
    addNode('subbrute', 'Subbrute', 'Active Enum', `python3 /usr/share/subbrute/subbrute.py ${domain} -w /usr/share/wordlists/nmap.lst -o brute_subs.txt`, '', 1800, activeY + 250, 'active');
    addNode('massdns', 'MassDNS', 'Active Enum', `massdns -r /usr/share/wordlists/resolvers.txt -t A -o S -w ${domain}.txt`, '', 2100, activeY + 250, 'active');
    addNode('ffuf-sub', 'FFUF Subdomains', 'Active Enum', `ffuf -u http://FUZZ.${domain} -c -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 100 -fc 403`, '', 2400, activeY + 250, 'active');

    // Merge (Centered below everything)
    const mergeY = 900;
    addNode('merge', 'Merge Results', 'Active Enum', 'cat *.txt | sort -u > all_subdomains.txt', '', rootX, mergeY, 'active');


    // Branch B: Probing (Below Merge)
    const probeY = 1200;
    addNode('probing', 'HTTP Probing', 'Probing', '', '', rootX, probeY, 'merge');

    // Probing Tools - Spread out
    addNode('httpx', 'httpx', 'Probing', 'cat all_subdomains.txt | httpx -silent -o live_subdomains.txt', '', rootX - 400, probeY + 250, 'probing');
    addNode('httprobe', 'httprobe', 'Probing', 'cat all_subdomains.txt | httprobe | tee -a alive_subdomains.txt', '', rootX + 400, probeY + 250, 'probing');


    // Branch C: Port & IP (Below Probing, Far Right)
    const portY = 1700;
    const portX = 2600;
    addNode('port-ip', 'Port & IP Scanning', 'Port Scanning', '', '', portX, portY, 'probing');

    addNode('dnsx', 'dnsx', 'Port Scanning', 'dnsx -l live_subdomains.txt -a -resp-only -o live_ips.txt', '', portX - 400, portY + 250, 'port-ip');
    addNode('shodanx', 'Shodanx', 'Port Scanning', `shodanx domain --domain "${domain}"`, '', portX, portY + 250, 'port-ip');
    addNode('naabu', 'Naabu', 'Port Scanning', 'naabu -list live_subdomains.txt -o naabu_scans.txt', '', portX + 400, portY + 250, 'port-ip');


    // Branch D: Fingerprinting (Below httpx, Left)
    const fingerY = 1700;
    const fingerX = 600;
    addNode('fingerprint', 'Fingerprinting', 'Fingerprinting', '', '', fingerX, fingerY, 'httpx');
    addNode('httpx-tech', 'httpx Tech Detect', 'Fingerprinting', 'httpx -l live_subdomains.txt -silent -status-code -tech-detect -title -sc -location -td -cl -probe -o httpx_output.txt', '', fingerX - 300, fingerY + 250, 'fingerprint');
    addNode('waf', 'WAF ID', 'Fingerprinting', 'cat httpx_output.txt | grep 403', '', fingerX + 300, fingerY + 250, 'fingerprint');

    // Branch E: Visual Recon (Below httpx, Center-Left)
    const visualY = 1700;
    const visualX = 1400;
    addNode('visual', 'Visual Recon', 'Visual Recon', '', '', visualX, visualY, 'httpx');
    addNode('aquatone', 'Aquatone', 'Visual Recon', 'cat live_subdomains.txt | aquatone -out screenshots', '', visualX - 300, visualY + 250, 'visual');
    addNode('gowitness', 'Gowitness', 'Visual Recon', 'gowitness scan file -f live_subdomains.txt --threads 10 --screenshot-path screenshots', '', visualX + 300, visualY + 250, 'visual');

    // Branch F: Content Discovery (Way below Fingerprint)
    const contentY = 2400;
    const contentX = 800;
    addNode('content-disc', 'Content Discovery', 'Content Discovery', '', '', contentX, contentY, 'httpx');
    addNode('ffuf-dir', 'FFUF Dir', 'Content Discovery', `ffuf -u https://${domain}/FUZZ -w /usr/share/wordlists/dirb/common.txt`, '', contentX - 450, contentY + 250, 'content-disc');
    addNode('gobuster', 'Gobuster', 'Content Discovery', `gobuster dir --url https://${domain} --wordlist /usr/share/wordlists/dirb/common.txt`, '', contentX, contentY + 250, 'content-disc');
    addNode('dirsearch', 'Dirsearch', 'Content Discovery', `dirsearch -u https://${domain}/ -w /usr/share/wordlists/dirnext/general.txt --full-url --random-agent -x 404,400 -e php,html,js`, '', contentX + 450, contentY + 250, 'content-disc');

    // Branch G: URL Extraction (Below Visual)
    const urlY = 2400;
    const urlX = 2200;
    addNode('urls', 'URL Extraction', 'URL Extraction', '', '', urlX, urlY, 'httpx');
    addNode('wayback', 'Waybackurls', 'URL Extraction', 'cat live_subs.txt | waybackurls | anew wayback_urls.txt', '', urlX - 450, urlY + 250, 'urls');
    addNode('gau', 'Gau', 'URL Extraction', 'cat live_subs.txt | gau | anew gau_urls.txt', '', urlX, urlY + 250, 'urls');
    addNode('katana', 'Katana', 'URL Extraction', 'katana -list live_subdomain.txt -f qurl | anew katana_urls.txt', '', urlX + 450, urlY + 250, 'urls');

    // Branch H: Vuln Filtering (Below URLs)
    const vulnY = 3000;
    const vulnX = urlX;
    addNode('vuln', 'Vuln Filtering', 'Vulnerability Filtering', '', '', vulnX, vulnY, 'katana');
    addNode('gf-xss', 'GF XSS', 'Vulnerability Filtering', 'cat all_urls.txt | gf xss | anew xss_candidates.txt', '', vulnX - 400, vulnY + 250, 'vuln');
    addNode('gf-sqli', 'GF SQLi', 'Vulnerability Filtering', 'cat all_urls.txt | gf sqli | anew sqli_candidates.txt', '', vulnX, vulnY + 250, 'vuln');
    addNode('gf-ssti', 'GF SSTI', 'Vulnerability Filtering', 'cat all_urls.txt | gf ssti| anew ssti_candidates.txt', '', vulnX + 400, vulnY + 250, 'vuln');

    return { nodes, edges };
};
