var downloadData;

function HandleDownload(fileType) {
    if (downloadData) {
        var downloadURLs;
        var fileNames = [...downloadData.fileNames];

        switch (fileType) {
            case "pdf":
                downloadURLs = downloadData.pdfDownloadLinks;
                break;

            case "xml":
                downloadURLs = downloadData.xmlDownloadLinks;
                break;

            default:
                break;
        }

        var interval = setInterval(function () {
            var url = downloadURLs.shift();
            var fileName = fileNames.shift();
            if (url) {
                chrome.downloads.download({
                        url: url,
                        filename: fileName + (fileType == "pdf" ? ".pdf" : ".xml")
                    },
                    function (downloadId) {},
                );
            } else {
                clearInterval(this);
            }
        }, 1000);
    }
}

function GetData() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                data: "full"
            }, (response) => {
                downloadData = response;
                resolve();
            });
        });
    })

};

window.onload = function () {
    GetData()
        .then(() => {
            if(downloadData.fileNames.length == 0) {
                document.getElementById("downloadPDF").setAttribute("disabled", true);
                document.getElementById("downloadXML").setAttribute("disabled", true);
            } else {
                document.getElementById("downloadPDF").onclick = function () {
                    HandleDownload("pdf")
                };
                document.getElementById("downloadXML").onclick = function () {
                    HandleDownload("xml")
                };
            }
            
            document.getElementById("countBadgePDF").innerText = downloadData.fileNames.length;
            document.getElementById("countBadgeXML").innerText = downloadData.fileNames.length;
        })
};