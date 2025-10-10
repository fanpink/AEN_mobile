using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Word = Microsoft.Office.Interop.Word;

namespace Auto_Earthquake_Notification
{
    internal class worddot
    {
        public string ExportWord(string templateFile, string fileName)
        {
            try
            {
                //生成word程序对象
                Word.Application app = new Word.Application();

                //模板文件
                string TemplateFile = templateFile;
                //生成的具有模板样式的新文件
                string FileName = fileName;

                //模板文件拷贝到新文件
                File.Copy(TemplateFile, FileName);
                //生成documnet对象
                Word.Document doc = new Word.Document();
                object Obj_FileName = FileName;
                object Visible = false;
                object ReadOnly = false;
                object missing = System.Reflection.Missing.Value;

                //打开文件
                doc = app.Documents.Open(ref Obj_FileName, ref missing, ref ReadOnly, ref missing,
                    ref missing, ref missing, ref missing, ref missing,
                    ref missing, ref missing, ref missing, ref Visible,
                    ref missing, ref missing, ref missing,
                    ref missing);
                doc.Activate();

                int WordNum = 4;//书签个数
                //将光标转到模板中定义的书签的位置，插入所需要添加的内容，循环次数与书签个数相符
                for (int WordIndex = 1; WordIndex <= WordNum; WordIndex++)
                {
                    object WordMarkName = "书签名称" + WordIndex.ToString();//word模板中的书签名称
                    object what = Word.WdGoToItem.wdGoToBookmark;
                    doc.ActiveWindow.Selection.GoTo(ref what, ref missing, ref missing, ref WordMarkName);//光标转到书签的位置
                    doc.ActiveWindow.Selection.TypeText("插入的内容" + WordIndex.ToString());//插入的内容，插入位置是word模板中书签定位的位置
                    doc.ActiveWindow.Selection.ParagraphFormat.Alignment = Word.WdParagraphAlignment.wdAlignParagraphCenter;//设置当前定位书签位置插入内容的格式
                    //doc.ActiveWindow.Selection.TypeParagraph();//回车换行
                }

                //输出完毕后关闭doc对象
                object IsSave = true;
                doc.Close(ref IsSave, ref missing, ref missing);
                app.Quit(ref missing, ref missing, ref missing);

                return ("生成“" + FileName + "”成功!");
            }
            catch (Exception Ex)
            {

                return Ex.ToString();
            }
        }
        public string ReplaceWord2(string templateFile, string NewfileName, Dictionary<string, string> dicDatasTemp)
        {
            try
            {
                Word.Application app = new Word.Application();

                string templetFileName = templateFile;
                string newFileName = NewfileName;
                //File.Copy(templetFileName, newFileName);

                object oMissing = System.Reflection.Missing.Value;
                object replace = Word.WdReplace.wdReplaceAll;
                //object objNewFileName = newFileName;
                //Document doc = app.Documents.Open(ref objNewFileName,
                //    ref oMissing, ref oMissing, ref oMissing, ref oMissing, ref oMissing,
                //    ref oMissing, ref oMissing, ref oMissing, ref oMissing, ref oMissing,
                //    ref oMissing, ref oMissing, ref oMissing, ref oMissing, ref oMissing);
                Word.Document doc = app.Documents.Open(templetFileName);

                Dictionary<string, string> dicDatas = dicDatasTemp;
                /*new Dictionary<string, string>()
                {
                    { "{期号}","2" },
                    { "{发文日期}","2022年7月27日"},
                    { "{标题}","替换标题"},
                    { "{时间}","7月27日19时24分"},
                    { "{地点}","替换地点"},
                    { "{震级}","6.0"},
                    { "{深度}","10"},
                    { "{纬度}","29.42"},
                    { "{经度}","103.54"},
                    { "{距离}","225"},
                    { "{烈度}","6"},
                    { "{政府分管领导}","周副县长"}
                };*/

                foreach (var item in dicDatas)
                {
                    app.Selection.Find.ClearFormatting();
                    app.Selection.Find.Replacement.ClearFormatting();
                    app.Selection.Find.Text = item.Key;
                    app.Selection.Find.Replacement.Text = item.Value;

                    app.Selection.Find.Execute(
                        ref oMissing, ref oMissing, ref oMissing, ref oMissing,
                        ref oMissing, ref oMissing, ref oMissing, ref oMissing,
                        ref oMissing, ref oMissing, ref replace, ref oMissing,
                        ref oMissing, ref oMissing, ref oMissing);

                }

                //doc.Save();
                doc.SaveAs2(newFileName);

                //doc.Close(ref oMissing, ref oMissing, ref oMissing);
                //app.Quit(ref oMissing, ref oMissing, ref oMissing);
                doc.Close();
                app.Quit();
                return "生成成功。\t";
            }
            catch (Exception ex)
            {
                return "生成失败：\t"+ ex.ToString();

            }

        }
        public string WordConvertPDF(string sourcePath, string targetPath)
        {
            string result;
            Word.WdExportFormat exportFormat = Word.WdExportFormat.wdExportFormatPDF;   //PDF格式
            object paramMissing = Type.Missing;
            
            Word.Application wordApplication = new Word.Application();
            Word.Document wordDocument = null;
            try
            {
                object paramSourceDocPath = sourcePath;
                string paramExportFilePath = targetPath;

                Word.WdExportFormat paramExportFormat = exportFormat;
                bool paramOpenAfterExport = false;
                Word.WdExportOptimizeFor paramExportOptimizeFor =
                        Word.WdExportOptimizeFor.wdExportOptimizeForPrint;
                Word.WdExportRange paramExportRange = Word.WdExportRange.wdExportAllDocument;
                int paramStartPage = 0;
                int paramEndPage = 0;
                Word.WdExportItem paramExportItem = Word.WdExportItem.wdExportDocumentContent;
                bool paramIncludeDocProps = true;
                bool paramKeepIRM = true;
                Word.WdExportCreateBookmarks paramCreateBookmarks =
                        Word.WdExportCreateBookmarks.wdExportCreateWordBookmarks;
                bool paramDocStructureTags = true;
                bool paramBitmapMissingFonts = true;
                bool paramUseISO19005_1 = false;

                wordDocument = wordApplication.Documents.Open(
                        ref paramSourceDocPath, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing);

                if (wordDocument != null)
                {
                    wordDocument.ExportAsFixedFormat(paramExportFilePath,
                            paramExportFormat, paramOpenAfterExport,
                            paramExportOptimizeFor, paramExportRange, paramStartPage,
                            paramEndPage, paramExportItem, paramIncludeDocProps,
                            paramKeepIRM, paramCreateBookmarks, paramDocStructureTags,
                            paramBitmapMissingFonts, paramUseISO19005_1,
                            ref paramMissing);
                    result = "生成成功。";
                }
                else
                    result = "word文件不存在";
            }
            catch (Exception ex)
            {
                result = "生成失败："+ ex;
            }
            finally
            {
                if (wordDocument != null)
                {
                    wordDocument.Close(ref paramMissing, ref paramMissing, ref paramMissing);
                    wordDocument = null;
                }
                if (wordApplication != null)
                {
                    wordApplication.Quit(ref paramMissing, ref paramMissing, ref paramMissing);
                    wordApplication = null;
                }
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
            return result;
        }
    }        
}
