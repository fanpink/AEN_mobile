
using Microsoft.Office.Interop.Word;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Auto_Earthquake_Notification
{
    internal class Eqget
    {
        public string M_M = null;
        public string time_M = null;
        public string wei_M = null;
        public string jing_M = null;
        public string deeth_M = null;
        public string diming_M = null;
        public string title_M = null;


        public string Html
        {
            get
            {
                //string json = "";
                string hurl = "https://news.ceic.ac.cn/speedsearch.html";

                string htmltext = Get1(hurl);//调用get方法获取网页文本
                string htmlContent = htmltext;
                string newdataJson = ExtractNewdata(htmlContent);

                return newdataJson; 
            }
        }
        public static string ExtractNewdata(string html)
        {
            string pattern = @"const newdata = (\[.*?\]);"; var match = Regex.Match(html, pattern, RegexOptions.Singleline); if (match.Success)
            {
                // 去除匹配结果中的JavaScript注释
                string newdataJson = match.Groups[1].Value;
                newdataJson = Regex.Replace(newdataJson, @"/\*.*?\*/", string.Empty, RegexOptions.Singleline);
                return newdataJson;
            }
            return string.Empty;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        public string Get1(string url)
        {
            WebClient myWebClient = new WebClient();
            //先根据用户请求的uri构造请求地址
            string serviceUrl = url;
            //创建Web访问对  象
            HttpWebRequest myRequest = (HttpWebRequest)WebRequest.Create(serviceUrl);
            //通过Web访问对象获取响应内容
            HttpWebResponse myResponse = (HttpWebResponse)myRequest.GetResponse();
            //通过响应内容流创建StreamReader对象，因为StreamReader更高级更快
            StreamReader reader = new StreamReader(myResponse.GetResponseStream(), Encoding.UTF8);
            //string returnXml = HttpUtility.UrlDecode(reader.ReadToEnd());//如果有编码问题就用这个方法
            string returnXml = reader.ReadToEnd();//利用StreamReader就可以从响应内容从头读到尾
            reader.Close();
            myResponse.Close();
            return returnXml;
        }

        public string Get(string url)
        {
            string re = "";
            try
            {
                using (WebClient client = new WebClient())
                {
                    //设置编码格式
                    client.Encoding = System.Text.Encoding.UTF8;
                    //获取数据
                    var result = client.DownloadString(url);
                    return result;
                }
            }
            catch (WebException ex)
            {
                if (ex.GetType().Name == "WebException")
                {
                    WebException we = (WebException)ex;
                    using (HttpWebResponse hr = (HttpWebResponse)we.Response)
                    {
                        int statusCode = (int)hr.StatusCode;
                        StringBuilder sb = new StringBuilder();
                        StreamReader sr = new StreamReader(hr.GetResponseStream(), Encoding.UTF8);
                        sb.Append(sr.ReadToEnd());
                        //Console.WriteLine("StatusCode:{0},Content:{1}", statusCode, sb);// StatusCode:401,Content:test
                        re = "StatusCode:" + statusCode + "Content:{1}" + sb;//, statusCode, sb);// StatusCode:401,Content:test
                        
                    }
                }
                return re;
            }
        }

        public string Eqdata2json(string M, string time, string wei, string jing, string deeth, string diming, string url)
        {
            Eqdata eqdata = new Eqdata();
            eqdata.title = diming + "发生" + M + "地震";
            eqdata.time = time;
            eqdata.M = M;
            eqdata.local = "纬度：" + wei + "|经度：" + jing;
            eqdata.deeth = deeth;
            eqdata.from = "中国地震台网中心";
            eqdata.info = String.Format("根据中国地震台网测定，{1}在{2}发生了{3}级地震，震源深度{4}公里，震中位于({5},{6}')。", "", time, diming, M, deeth, jing, wei);

            eqdata.title = String.Format("{0}发生{1}级地震", diming, M);
            eqdata.url = url;
            string json = JsonConvert.SerializeObject(eqdata);
            return json;
        }
        public struct Eqdata
        {
            public string title { get; set; }
            public string time { get; set; }
            public string M { get; set; }
            public string local { get; set; }
            public string deeth { get; set; }
            public string from { get; set; }
            public string info { get; set; }
            public string url { get; set; }

        }
        public class Root //JSON数据的实体类
        {
            /// <summary>
            /// 
            /// </summary>
            public List<ShujuItem> shuju { get; set; }
            /// <summary>
            /// 最近24小时地震信息
            /// </summary>
            public string jieguo { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string page { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public int num { get; set; }
        }
        public class ShujuItem //JSON数据的实体类
        {
            /// <summary>
            /// 
            /// </summary>
            public string id { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string CATA_ID { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string SAVE_TIME { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string O_TIME { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string EPI_LAT { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string EPI_LON { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public int EPI_DEPTH { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string AUTO_FLAG { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string EQ_TYPE { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string O_TIME_FRA { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string M { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string M_MS { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string M_MS7 { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string M_ML { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string M_MB { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string M_MB2 { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string SUM_STN { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string LOC_STN { get; set; }
            /// <summary>
            /// 印尼班达海
            /// </summary>
            public string LOCATION_C { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string LOCATION_S { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string CATA_TYPE { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string SYNC_TIME { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string IS_DEL { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string EQ_CATA_TYPE { get; set; }
            /// <summary>
            /// 
            /// </summary>
            public string NEW_DID { get; set; }
        }
        public static string DecodeString1(string unicode)//解码unicode方法
        {
            if (string.IsNullOrEmpty(unicode))
            {
                return string.Empty;
            }
            return System.Text.RegularExpressions.Regex.Unescape(unicode);
        }

    }
}