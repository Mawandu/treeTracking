import csv
import json
import ipfshttpclient


def add_logs_to_ipfs(csv_file, output_file="ipfs_mapping.json"):
    client = ipfshttpclient.connect()
    results = []
    with open(csv_file, newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            data = json.dumps(row)
            ipfs_hash = client.add_str(data)
            results.append({"Numéro": row.get("Numéro"), "ipfs_hash": ipfs_hash})
    with open(output_file, "w", encoding="utf-8") as out:
        json.dump(results, out, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    add_logs_to_ipfs("../treeTracking.csv")

