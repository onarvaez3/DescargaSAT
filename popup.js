var downloadData;

function HandleDownload(fileType, downloadOption = "individual") {
    if (downloadData) {
        var downloadURLs = new Array();

        if(fileType == "all" || fileType == "pdf")
        {
            downloadData.records.forEach(element => {
                if(element.pdfDownloadLink)
                {
                    let record = {
                        "filename": element.filename,
                        "downloadURL": element.pdfDownloadLink,
                        "fileType": "pdf"
                    };
                    downloadURLs.push(record);
                }
            });
        }

        if(fileType == "all" || fileType == "cancel")
        {
            downloadData.records.forEach(element => {
                if(element.cancelDownloadLink)
                {
                    let record = {
                        "filename": element.filename,
                        "downloadURL": element.cancelDownloadLink,
                        "fileType": "pdf"
                    };
                    downloadURLs.push(record);
                }
            });
        }

        if(fileType == "all" || fileType == "xml")
        {
            downloadData.records.forEach(element => {
                if(element.xmlDownloadLink)
                {
                    let record = {
                        "filename": element.filename,
                        "downloadURL": element.xmlDownloadLink,
                        "fileType": "xml"
                    };
                    downloadURLs.push(record);
                }
            });
        }

        if(fileType == "all" || downloadOption == "zip")
        {
            DownloadGroup(downloadURLs).then(downloadGrp => ExportZip(downloadGrp, downloadData.zipFileName));
        } 
        else
        {
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
            }, 500);
        }
    }
}

function GetBlob(downloadRecord)
{
    downloadRecord["blob"] = fetch(downloadRecord.downloadURL).then(resp => resp.blob());
    return downloadRecord;
}

function DownloadGroup(downloadRecords, filesPerGroup = 5)
{
    return Promise.map(
        downloadRecords,
        async record => {
            return await GetBlob(record);
        },
        {concurrency: filesPerGroup}
    )
}

function ExportZip(downloadRecords, zipFileName)
{
    const zip = new JSZip();
    downloadRecords.forEach(record => {
        zip.file(record.filename + (record.fileType == "pdf" ? ".pdf" : ".xml"), record.blob)
    });

    zip.generateAsync({type: 'blob'}).then(zipFile => {
        var url = URL.createObjectURL(zipFile);
        var today = new Date();
        chrome.downloads.download({
            url: url,
            filename: zipFileName + new Date().toJSON().slice(0,10) + ".zip"
        });
    });

    downloadRecords.forEach(record => {
        console.log(record["filename"]);
    })
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
                if(response == null)
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
                    document.getElementById("btnDropDownPdf").setAttribute("disabled", true);
                } else {
                    document.getElementById("downloadPDF").onclick = function () {
                        HandleDownload("pdf")
                    };
                    document.getElementById("btnDownloadZipPdf").onclick = function () {
                        HandleDownload("pdf", "zip")
                    };
                }

                if(downloadData.xmlCount == 0) {
                    document.getElementById("downloadXML").setAttribute("disabled", true);
                    document.getElementById("btnDropDownXml").setAttribute("disabled", true);
                } else {
                    document.getElementById("downloadXML").onclick = function () {
                        HandleDownload("xml")
                    };
                    document.getElementById("btnDownloadZipXml").onclick = function () {
                        HandleDownload("xml", "zip")
                    };
                }

                if(downloadData.cancelCount == 0) {
                    document.getElementById("downloadCancel").setAttribute("disabled", true);
                    document.getElementById("btnDropDownCancel").setAttribute("disabled", true);
                } else {
                    document.getElementById("downloadCancel").onclick = function () {
                        HandleDownload("cancel")
                    };
                    document.getElementById("btnDownloadZipCancel").onclick = function () {
                        HandleDownload("cancel", "zip")
                    };
                }

                if(downloadData.allCount == 0) {
                    document.getElementById("downloadAll").setAttribute("disabled", true);
                } else {
                    document.getElementById("downloadAll").onclick = function () {
                        HandleDownload("all")
                    };
                }
                
                document.getElementById("countBadgePDF").innerText = downloadData.pdfCount;
                document.getElementById("countBadgeXML").innerText = downloadData.xmlCount;
                document.getElementById("countBadgeCancel").innerText = downloadData.cancelCount;
                document.getElementById("countBadgeAll").innerText = downloadData.allCount;
        }, () => {
            document.getElementById("downloadPDF").setAttribute("disabled", true);
            document.getElementById("btnDropDownPdf").setAttribute("disabled", true);
            document.getElementById("downloadXML").setAttribute("disabled", true);
            document.getElementById("btnDropDownXml").setAttribute("disabled", true);
            document.getElementById("downloadCancel").setAttribute("disabled", true);
            document.getElementById("btnDropDownCancel").setAttribute("disabled", true);
            document.getElementById("downloadAll").setAttribute("disabled", true);
        })
};