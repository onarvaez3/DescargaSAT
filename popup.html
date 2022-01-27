var downloadData;

function HandleDownload(fileType) {
    if (downloadData) {
        var downloadURLs = new Array();

        switch (fileType) {
            case "pdf":
                downloadData.records.forEach(element => {
                    if(element.pdfDownloadLink)
                    {
                        let record = {
                            "filename": element.filename,
                            "downloadURL": element.pdfDownloadLink
                        };
                        downloadURLs.push(record);
                    }
                });
            break;

            case "cancel":
                downloadData.records.forEach(element => {
                    if(element.cancelDownloadLink)
                    {
                        let record = {
                            "filename": element.filename,
                            "downloadURL": element.cancelDownloadLink
                        };
                        downloadURLs.push(record);
                    }
                });
            break;

            case "xml":
                downloadData.records.forEach(element => {
                    if(element.xmlDownloadLink)
                    {
                        let record = {
                            "filename": element.filename,
                            "downloadURL": element.xmlDownloadLink
                        };
                        downloadURLs.push(record);
                    }
                });
                break;

            default:
                break;
        }

        var interval = setInterval(function () {
            var record = downloadURLs.shift();
            if (record) {
                chrome.downloads.download({
                        url: record.downloadURL,
                        filename: record.filename + (fileType == "pdf" ? ".pdf" : ".xml")
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
                if(response == "Counters mismatch")
                {
                    reject();
                }
                else
                {
                    downloadData = response;
                    resolve();
                }
            });
        });
    })

};

window.onload = function () {
    GetData()
        .then(() => {
            if(downloadData.pdfCount == 0)
            {
                document.getElementById("downloadPDF").setAttribute("disabled", true);
            } else {
                document.getElementById("downloadPDF").onclick = function () {
                    HandleDownload("pdf")
                };
            }

            if(downloadData.xmlCount == 0) {
                document.getElementById("downloadXML").setAttribute("disabled", true);
            } else {
                document.getElementById("downloadXML").onclick = function () {
                    HandleDownload("xml")
                };
            }

            if(downloadData.cancelCount == 0) {
                document.getElementById("downloadCancel").setAttribute("disabled", true);
            } else {
                document.getElementById("downloadCancel").onclick = function () {
                    HandleDownload("cancel")
                };
            }
            
            document.getElementById("countBadgePDF").innerText = downloadData.pdfCount;
            document.getElementById("countBadgeXML").innerText = downloadData.xmlCount;
            document.getElementById("countBadgeCancel").innerText = downloadData.cancelCount;
        })
};
