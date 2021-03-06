package com.zdnf.bbs.service;

import com.zdnf.bbs.domain.Post;
import com.zdnf.bbs.domain.Replay;
import com.zdnf.bbs.tools.GlobalConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zdnf.bbs.dao.UserApiDao;
import com.zdnf.bbs.domain.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import com.zdnf.bbs.tools.FileUp;
import com.zdnf.bbs.tools.ImgCompression;

/**
 * Created by ZDNF on 2017/5/11.
 */
@Service
public class UserApiService {
    @Autowired
    UserApiDao UserApiDao;
    @Autowired
    FileUp FileUp;

    public User GetUserInfo(String name){return UserApiDao.GetUserInfo(name);}

    public List<Replay> GetUserReply(String name, int page){
        int low=10*(page-1);
        return UserApiDao.GetUserReply(name,low);
    }

    public List<Post> GetUserPost(String name, int page){
        int low=10*(page-1);
        return UserApiDao.GetUserPost(name,low);
    }

    public boolean up(MultipartFile file,String id){
        Boolean IsExist=false;

        if (file.isEmpty())return false;
        //文件路径
        String filePath = GlobalConfig.FilePath;
        //创建文件
        File dest = new File(filePath + id+".jpg");
        //判断文件路径存不存在
        if (!dest.getParentFile().exists()) {
            dest.getParentFile().mkdirs();
        }
        //判断文件存不存在 存在就删掉
        if (dest.exists()&dest.isFile()){
            dest.delete();

            IsExist = true;//判断文件存在
        }
        try {
            //将文件写入硬盘
            file.transferTo(dest);
            //对文件进行压缩处理
            ImgCompression runner =new ImgCompression();
            runner.run(id+".jpg");

            /**
             * 这里是头像上传七牛的接口，暂时去掉。
             */
            FileUp.upload(id,UserApiDao.GetNameById(id),IsExist);
            return true;
        } catch (IllegalStateException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public String GetIdByName(String name){
       return UserApiDao.GetIdByName(name);
    }

    public String GetPasswdById(String id){return UserApiDao.GetPasswdById(id);}


}
