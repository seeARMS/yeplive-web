using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using System.Collections;

namespace HDFVR
{
    public partial class uploadFromMobile : System.Web.UI.Page
    {
        private const string UPLOAD_DIRECTORY = "mobileRecordings/";
        
        protected void Page_Load(object sender, EventArgs e)
        {
            string response = string.Empty;

            if (HttpContext.Current.Request.Files.Count > 0)
            {
                HttpPostedFile file = HttpContext.Current.Request.Files["FileInput"];

                if (file != null && file.ContentLength > 0)
                {
                    string filename = Path.GetFileName(file.FileName);
                    string uploadDirectory = HttpContext.Current.Server.MapPath(UPLOAD_DIRECTORY);
                    if (!Directory.Exists(uploadDirectory))
                    {
                        Directory.CreateDirectory(uploadDirectory);
                    }

                    Random rnd = new Random();
                    int randomed = rnd.Next(1, int.MaxValue);

                    string baseFilename = Path.GetFileNameWithoutExtension(filename);
                    string baseExtension = Path.GetExtension(filename);
                    string newFileName = Path.Combine(uploadDirectory, "video_stream_" + randomed + baseExtension);

                    try
                    {
                        file.SaveAs(newFileName);
                        response = "video_stream_" + randomed + baseExtension + "#Success! File Uploaded.";
                    }
                    catch
                    {
                        response = "Error uploading File!";
                    }
                }


                Response.Write(response);
            }
            else
            {
                Response.Write("Something went wrong, file may be to big");
            }
        }
    }
}