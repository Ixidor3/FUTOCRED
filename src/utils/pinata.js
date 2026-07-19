import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

// Upload a PDF file to Pinata and return the IPFS CID
export async function uploadPDFToPinata(file) {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);

    const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.IpfsHash;
}

// Build a gateway URL from a CID so verifiers can view/download the PDF
export function getIPFSUrl(cid) {
    const gateway = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud";
    return `${gateway}/ipfs/${cid}`;
}