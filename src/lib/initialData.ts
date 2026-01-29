import { type Node, type Edge } from 'reactflow';

// Dynamically import all markdown files from the knowledge_base
// const modules = import.meta.glob('/src/assets/knowledge_base/*.md', { as: 'raw', eager: true });

export const getInitialData = (): { nodes: Node[]; edges: Edge[] } => {
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
    addNode('recon', 'Reconnaissance', 'Root', '', 'Start of the workflow', 1200, 0);

    // Branch A: Subdomain Enumeration
    // Centered relative to root, but branches need wide separation
    const enumCenter = 1200;
    addNode('sub-enum', 'Subdomain Enumeration', 'Passive Enum', '', 'Finding subdomains', enumCenter, 200, 'recon');

    // Passive Branch (Left Side)
    // Shift left by 600px
    const passiveX = enumCenter - 800;
    const passiveY = 400;
    addNode('passive', 'Passive Enum', 'Passive Enum', '', 'Using 3rd party sources', passiveX + 200, passiveY, 'sub-enum');

    // Passive Tools - Distributed horizontally
    addNode('subfinder', 'Subfinder', 'Passive Enum', 'subfinder -d target.com -all -silent -o subfinder-subs.txt', 'Fast passive enumeration tool', passiveX, passiveY + 250, 'passive');
    addNode('assetfinder', 'Assetfinder', 'Passive Enum', 'assetfinder -subs-only target.com | tee assetfinder_subs.txt', 'Finds domains from CAs and sources', passiveX + 250, passiveY + 250, 'passive');
    addNode('findomain', 'Findomain', 'Passive Enum', 'findomain --quiet -t target.com | tee findomain-subs.txt', 'Rust-based fast enumerator', passiveX + 500, passiveY + 250, 'passive');
    addNode('sublist3r', 'Sublist3r', 'Passive Enum', 'sublist3r -d target.com -t 50 -o sublist3r.txt', 'Python tool enumerating mostly from search engines', passiveX + 750, passiveY + 250, 'passive');
    addNode('amass', 'Amass', 'Passive Enum', 'amass enum -passive -d target.com -o amass_passive.txt', 'In-depth enumeration', passiveX + 1000, passiveY + 250, 'passive');

    // Active Branch (Right Side)
    // Shift right by 600px
    const activeX = enumCenter + 800;
    const activeY = 400;
    addNode('active', 'Active Enum', 'Active Enum', '', 'Bruteforcing and DNS queries', activeX - 200, activeY, 'sub-enum');

    // Active Tools
    addNode('subbrute', 'Subbrute', 'Active Enum', 'python3 subbrute.py target.com -w wordlist.txt -o brute_subs.txt', 'Recursive DNS spidering', activeX - 400, activeY + 250, 'active');
    addNode('massdns', 'MassDNS', 'Active Enum', '/usr/share/wordlists/2m-subdomains.txt | massdns -r /usr/share/wordlists/resolvers.txt t A -o S -w target.com.txt', 'High performance DNS resolver', activeX, activeY + 250, 'active');
    addNode('ffuf-sub', 'FFUF Subdomains', 'Active Enum', 'ffuf -u http://FUZZ.target.com -c -w wordlists -t 100 -fc 403 | tee ffuf_subs_output.txt', 'Fuzzing subdomains', activeX + 400, activeY + 250, 'active');

    // Merge (Centered below enumeration)
    addNode('merge', 'Merge Results', 'Active Enum', 'cat *.txt | anew all_subdomains.txt', 'Combine and deduplicate', enumCenter, 1000, 'active');


    // Branch B: Probing (Below Merge)
    const probeY = 1300;
    addNode('probing', 'HTTP Probing', 'Probing', '', 'Finding live hosts', enumCenter, probeY, 'merge'); // Connect to merge logically

    addNode('httpx', 'httpx', 'Probing', 'cat all_subdomains.txt | httpx -silent -o live_subdomains.txt', 'Fast HTTP toolkit', enumCenter - 300, probeY + 200, 'probing');
    addNode('httprobe', 'httprobe', 'Probing', 'cat all_subdomains.txt | httprobe | tee -a alive_subdomains.txt', 'Take domains and probe for http/https', enumCenter + 300, probeY + 200, 'probing');


    // Branch C: Port & IP (Below Probing)
    const portY = 1700;
    const portX = enumCenter + 1200; // Far right
    addNode('port-ip', 'Port & IP Scanning', 'Port Scanning', '', ' resolving IPs and scanning ports', portX, portY, 'probing'); // Logically after probing? or parallel?

    addNode('dnsx', 'dnsx', 'Port Scanning', 'dnsx -l live_subdomains.txt -a -resp-only -o live_ips.txt', 'DNS toolkit', portX - 300, portY + 200, 'port-ip');
    addNode('shodanx', 'Shodanx', 'Port Scanning', 'shodanx domain --domain "target.com"', 'Shodan CLI', portX, portY + 200, 'port-ip');
    addNode('naabu', 'Naabu', 'Port Scanning', 'naabu -list live_subs.txt -o naabu_scans.txt', 'Fast port scanner', portX + 300, portY + 200, 'port-ip');


    // Branch D: Fingerprinting (Below httpx)
    const fingerY = 1700;
    const fingerX = enumCenter - 600;
    addNode('fingerprint', 'Fingerprinting', 'Fingerprinting', '', 'Identify technologies and WAF', fingerX, fingerY, 'httpx');
    addNode('httpx-tech', 'httpx Tech Detect', 'Fingerprinting', 'httpx -list live_subdomains.txt -silent status-code -tech-detect -title -sc -location td -cl -probe -o httpx_output.txt', 'Detailed fingerprinting', fingerX - 200, fingerY + 200, 'fingerprint');
    addNode('waf', 'WAF ID', 'Fingerprinting', 'cat httpx_output.txt | grep 403', 'Identify WAFs', fingerX + 200, fingerY + 200, 'fingerprint');

    // Branch E: Visual Recon (Below httpx)
    const visualY = 1700;
    const visualX = enumCenter; // Center
    addNode('visual', 'Visual Recon', 'Visual Recon', '', 'Screenshots', visualX, visualY, 'httpx');
    addNode('aquatone', 'Aquatone', 'Visual Recon', 'cat live_subdomains.txt | aquatone -out screenshots', 'Visual inspection tool', visualX - 200, visualY + 200, 'visual');
    addNode('gowitness', 'Gowitness', 'Visual Recon', 'gowitness scan file -f live_subdomains.txt -threads 10 --screenshot-path screenshots', 'Golang screenshot tool', visualX + 200, visualY + 200, 'visual');

    // Branch F: Content Discovery (Way below)
    const contentY = 2200;
    const contentX = enumCenter - 900;
    addNode('content-disc', 'Content Discovery', 'Content Discovery', '', 'Directory bruteforce', contentX, contentY, 'httpx');
    addNode('ffuf-dir', 'FFUF Dir', 'Content Discovery', 'ffuf -u https://target.com/FUZZ -w //path/to/wordlist.txt', 'Fast web fuzzer', contentX - 300, contentY + 200, 'content-disc');
    addNode('gobuster', 'Gobuster', 'Content Discovery', 'gobuster dir --url https://target.com --wordlist /path/to/wordlist.txt', 'Directory/File/DNS busting', contentX, contentY + 200, 'content-disc');
    addNode('dirsearch', 'Dirsearch', 'Content Discovery', 'dirsearch -u https://target.com/ -w /usr/share/wordlists/custom.txt --full-url --random-agent -x 404,400 -e php,html,js,json,ini', 'Advanced web path scanner', contentX + 300, contentY + 200, 'content-disc');

    // Branch G: URL Extraction
    const urlY = 2200;
    const urlX = enumCenter + 900;
    addNode('urls', 'URL Extraction', 'URL Extraction', '', 'Wayback machine etc', urlX, urlY, 'httpx');
    addNode('wayback', 'Waybackurls', 'URL Extraction', 'cat live_subs.txt | waybackurls | anew wayback_urls.txt', 'Fetch known URLs from Wayback', urlX - 300, urlY + 200, 'urls');
    addNode('gau', 'Gau', 'URL Extraction', 'cat live_subs.txt | gau | anew gau_urls.txt', 'Get All Urls', urlX, urlY + 200, 'urls');
    addNode('katana', 'Katana', 'URL Extraction', 'katana -list live_subdomain.txt -f qurl | anew katana_urls.txt', 'Crawling and spidering', urlX + 300, urlY + 200, 'urls');

    // Branch H: Vuln Filtering (Below URLs)
    const vulnY = 2600;
    const vulnX = urlX;
    addNode('vuln', 'Vuln Filtering', 'Vulnerability Filtering', '', 'GF patterns', vulnX, vulnY, 'katana');
    addNode('gf-xss', 'GF XSS', 'Vulnerability Filtering', 'cat all_urls.txt | gf xss | anew xss_candidates.txt', 'Filter for XSS params', vulnX - 300, vulnY + 200, 'vuln');
    addNode('gf-sqli', 'GF SQLi', 'Vulnerability Filtering', 'cat all_urls.txt | gf sqli | anew sqli_candidates.txt', 'Filter for SQLi params', vulnX, vulnY + 200, 'vuln');
    addNode('gf-ssti', 'GF SSTI', 'Vulnerability Filtering', 'cat all_urls.txt | gf ssti| anew ssti_candidates.txt', 'Filter for SSTI params', vulnX + 300, vulnY + 200, 'vuln');

    return { nodes, edges };
};
