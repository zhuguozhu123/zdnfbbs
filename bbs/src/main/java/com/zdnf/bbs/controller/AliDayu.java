package com.zdnf.bbs.controller;

/**
 * Created by ZDNF on 2017/8/13.
 */
import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.IAcsClient;
import com.aliyuncs.dysmsapi.model.v20170525.SendSmsRequest;
import com.aliyuncs.dysmsapi.model.v20170525.SendSmsResponse;
import com.aliyuncs.exceptions.ClientException;
import com.aliyuncs.profile.DefaultProfile;
import com.aliyuncs.profile.IClientProfile;
import com.zdnf.bbs.dao.AlidayuDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 短信验证---阿里大于工具
 */
@Controller
@RequestMapping("/message")
public class AliDayu {
    @Autowired
    AlidayuDao AlidayuDao;

    //产品名称:云通信短信API产品,开发者无需替换
    private final String product = "Dysmsapi";
    //产品域名,开发者无需替换
    private final String domain = "dysmsapi.aliyuncs.com";

    // TODO 此处需要替换成开发者自己的AK(在阿里云访问控制台寻找)
    private final String accessKeyId = "";
    private final String accessKeySecret = "";

    public SendSmsResponse sendSms(String telnum,int code) throws ClientException {

        //可自助调整超时时间
        System.setProperty("sun.net.client.defaultConnectTimeout", "10000");
        System.setProperty("sun.net.client.defaultReadTimeout", "10000");

        //初始化acsClient,暂不支持region化
        IClientProfile profile = DefaultProfile.getProfile("cn-hangzhou", accessKeyId, accessKeySecret);
        DefaultProfile.addEndpoint("cn-hangzhou", "cn-hangzhou", product, domain);
        IAcsClient acsClient = new DefaultAcsClient(profile);
        //组装请求对象-具体描述见控制台-文档部分内容
        SendSmsRequest request = new SendSmsRequest();
        //必填:待发送手机号
        request.setPhoneNumbers(telnum);
        //必填:短信签名-可在短信控制台中找到
        request.setSignName("南巷BBS");
        //必填:短信模板-可在短信控制台中找到
        request.setTemplateCode("SMS_85445031");
        //可选:模板中的变量替换JSON串
        request.setTemplateParam("{\"yanzhengma\":\""+code+"\"}");
        SendSmsResponse sendSmsResponse = acsClient.getAcsResponse(request);

        return sendSmsResponse;
    }

    @RequestMapping("send")
    @ResponseBody
    public String run(String telnum) throws ClientException, InterruptedException {
        if(telnum.substring(0,3).equals("171")){
            return "error";
        }
        String toDayNum=AlidayuDao.getTodayNum(telnum);
        if (toDayNum==null)toDayNum=0+"";
        if (Integer.parseInt(toDayNum)>3){
            return "今日请求次数过多";
        }
        java.util.Random r=new java.util.Random();
        int code=r.nextInt(9000)+999;
        //发短信
        SendSmsResponse response = sendSms(telnum,code);
        if (toDayNum.equals("0")) {
            AlidayuDao.addTel(telnum, code,toDayNum);
            AlidayuDao.success(telnum,code);
        }else {
            AlidayuDao.success(telnum,code);
        }
        return response.getCode();
    }

    @RequestMapping("exist")
    @ResponseBody
    public String exist(String tel){
        return AlidayuDao.getIdByTel(tel);
    }


}
