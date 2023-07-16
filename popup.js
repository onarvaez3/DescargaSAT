var downloadData;

function HandleDownload(fileType, downloadOption = "individual") {
    if (downloadData) {
        var downloadURLs = new Array();

        if (fileType == "all" || fileType == "pdf") {
            downloadData.records.forEach(element => {
                if (element.pdfDownloadLink) {
                    let record = {
                        "filename": element.filename,
                        "downloadURL": element.pdfDownloadLink,
                        "fileType": "pdf"
                    };
                    if(downloadOption == "noNomina" && element.efecto != "Nómina")
                    {
                        downloadURLs.push(record);
                    }
                }
            });
        }

        if (fileType == "all" || fileType == "cancel") {
            downloadData.records.forEach(element => {
                if (element.cancelDownloadLink) {
                    let record = {
                        "filename": element.filename,
                        "downloadURL": element.cancelDownloadLink,
                        "fileType": "pdf"
                    };
                    downloadURLs.push(record);
                }
            });
        }

        if (fileType == "all" || fileType == "xml") {
            downloadData.records.forEach(element => {
                if (element.xmlDownloadLink) {
                    let record = {
                        "filename": element.filename,
                        "downloadURL": element.xmlDownloadLink,
                        "fileType": "xml"
                    };
                    if(downloadOption == "noNomina" && element.efecto != "Nómina")
                    {
                        downloadURLs.push(record);
                    }
                }
            });
        }

        if (fileType == "all" || downloadOption == "zip") {
            DownloadGroup(downloadURLs).then(downloadGrp => ExportZip(downloadURLs, downloadData.zipFileName));
        }
        else {
            var interval = setInterval(function () {
                var record = downloadURLs.shift();
                if (record) {
                    chrome.downloads.download({
                        url: record.downloadURL,
                        filename: record.filename + (fileType == "pdf" ? ".pdf" : ".xml")
                    },
                        function (downloadId) { },
                    );
                } else {
                    clearInterval(this);
                }
            }, 500);
        }
    }
}

function GetBlob(downloadRecord, retry = 0) {
    return fetch(downloadRecord.downloadURL).then(resp => (resp.blob().then(blob => {
        if (blob.size < 2000) {
            if (retry < 5) {
                delay(500).then(() => GetBlob(downloadRecord, retry++));
            } else {
                console.warn("Failed to obtain file from: " + downloadRecord.downloadURL);
            }
        } else {
            downloadRecord.blob = blob;
        }
    })));
}

function DownloadGroup(downloadRecords, filesPerGroup = 2) {
    ix = 0;
    return Promise.map(
        downloadRecords,
        async record => {
            SetProgress(ix++);
            return await GetBlob(record);
        },
        { concurrency: filesPerGroup }
    )
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function ExportZip(downloadRecords, zipFileName) {
    const zip = new JSZip();
    downloadRecords.forEach(record => {
        zip.file(record.filename + (record.fileType == "pdf" ? ".pdf" : ".xml"), record.blob)
    });

    zip.generateAsync({ type: 'blob' }).then(zipFile => {
        var url = URL.createObjectURL(zipFile);
        chrome.downloads.download({
            url: url,
            filename: zipFileName + new Date().toJSON().slice(0, 10) + ".zip"
        });
    });

    SetProgress(-1);
}

function SetProgress(progress) {
    if (progress == -1) {
        document.getElementById("spanProgress").innerText = "";
        document.getElementById("divProgress").style.display = "none";
    }
    else {
        document.getElementById("divProgress").style.display = "inline";
        document.getElementById("spanProgress").innerText = "Descargando (" + progress + ")";
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
                if (response == null) {
                    reject();
                }
                else {
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
            if (downloadData.pdfCount == 0) {
                document.getElementById("downloadPDF").setAttribute("disabled", true);
                document.getElementById("btnDropDownPdf").setAttribute("disabled", true);
            } else {
                document.getElementById("downloadPDF").onclick = function () {
                    HandleDownload("pdf")
                };
                document.getElementById("downloadPDFNoNomina").onclick = function () {
                    HandleDownload("pdf", "noNomina")
                };
                document.getElementById("btnDownloadZipPdf").onclick = function () {
                    HandleDownload("pdf", "zip")
                };
            }

            if (downloadData.xmlCount == 0) {
                document.getElementById("downloadXML").setAttribute("disabled", true);
                document.getElementById("btnDropDownXml").setAttribute("disabled", true);
            } else {
                document.getElementById("downloadXML").onclick = function () {
                    HandleDownload("xml")
                };
                document.getElementById("downloadXMLNoNomina").onclick = function () {
                    HandleDownload("xml", "noNomina")
                };
                document.getElementById("btnDownloadZipXml").onclick = function () {
                    HandleDownload("xml", "zip")
                };
            }

            if (downloadData.cancelCount == 0) {
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

            if (downloadData.allCount == 0) {
                document.getElementById("downloadAll").setAttribute("disabled", true);
            } else {
                document.getElementById("downloadAll").onclick = function () {
                    HandleDownload("all")
                };
            }

            document.getElementById("countBadgePDF").innerText = downloadData.pdfCount;
            document.getElementById("countBadgeXML").innerText = downloadData.xmlCount;
            document.getElementById("countBadgePDFNoNomina").innerText = downloadData.pdfCount - downloadData.nominaCount;
            document.getElementById("countBadgeXMLNoNomina").innerText = downloadData.xmlCount - downloadData.nominaCount;
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
