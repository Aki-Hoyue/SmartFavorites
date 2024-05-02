const data = {
  navigation : [
    {
      id: 0,
      text: "Home",
      icon: "home-alt",
      link: "/",
    },
    {
      id: 1,
      text: "Files",
      icon: "file-docs",
      link: "/files",
    },
    {
      id: 2,
      text: "Starred",
      icon: "star",
      link: "/starred",
    },
    {
      id: 3,
      text: "Search Online",
      icon: "search",
      link: "/search",
    },
    {
      id: 4,
      text: "RSS",
      icon: "rss",
      link: "/rss",
    },
    {
      id: 5,
      text: "Settings",
      icon: "setting",
      link: "/settings",
    },
  ],
}
export default data;

const determineIcon = (type) => {
  switch(type) {
    case 'TXT':
    case 'EPUB':
      return 'fileText';
    case 'PDF':
      return 'filePDF';
    case 'DOCX':
      return 'fileDoc';
    case 'XLSX':
      return 'fileSheet';
    case 'PPTX':
      return 'filePPT';
    case 'MD':
      return 'fileCode';
    default:
      return 'fileText';
  }
}

export const getFiles = async (userInfo) => {
  const email = userInfo.email;
  const uid = userInfo.uid;
  const loginAuth = userInfo.loginAuth;
  let files = []
  try {
    const respone = await fetch(`http://127.0.0.1:8000/files?email=${email}&uid=${uid}&loginAuth=${loginAuth}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    const respone_info = await respone.json()
    const count = respone_info["count"]
    const data = respone_info["data"]
    for (let i = 0; i < count; i++) {
      const type = data[i]["Type"].toUpperCase()
      const icon = determineIcon(type)
      let description;
      if (data[i]["Description"] != '')
        description = JSON.parse(data[i]["Description"].replace(/'/g, '"'));
      else 
        description = {"Author": "", "Abstract": "", "Cover": ""}
      files.push({
        id: data[i]["FID"],
        name: data[i]["Filename"],
        type: type,
        icon: icon,
        starred: false,
        author: description["Author"],
        abstract: description["Abstract"],
        cover: description["Cover"]
      })
    }
  } catch (error) {
    console.log(error)
  }
  return files
}

/*
export const files = [
  {
    id: '0',
    name: 'test.txt',
    icon: 'fileText',
    type: 'file',
    starred: true,
    abstract: 'Fuck',
    author: 'Hoyue',
    cover: ''
  },
]
*/

/*
export const files = [
  {
    id: '0',
    name: 'test.txt',
    icon: 'fileText',
    type: 'file',
    starred: true,
    abstract: 'Fuck',
    author: 'Hoyue',
    cover: ''
  },
  {
    id: 'folder002',
    name: 'Proposal',
    ext: 'zip',
    time: '02:07 PM',
    date: '03 Mar',
    icon: 'folder',
    size: 93,
    type: 'folder',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005']
  },
  {
    id: 'folder003',
    name: 'A Projects',
    ext: 'zip',
    time: '02:07 PM',
    date: '03 Mar',
    icon: 'folder',
    size: 93,
    type: 'folder',
    starred: false,
    deleted: '02:07 PM, 03 Mar'
  },
  {
    id: 'folder004',
    name: 'DashLite Resource',
    ext: 'zip',
    time: '02:07 PM',
    date: '03 Mar',
    icon: 'folderSecure',
    size: 93,
    type: 'folder',
    starred: true,
    access:['uid001', 'uid003', 'uid004', 'uid005']
  },
  {
    id: 'folder005',
    name: '2019 Projects',
    ext: 'zip',
    time: '02:07 PM',
    date: '03 Mar',
    icon: 'folder',
    size: 93,
    type: 'folder',
    starred: false,
  },
  {
    id: 'file001',
    name: 'Update Data.xlsx',
    ext: 'xlsx',
    icon: 'fileSheet',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: true,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
  },
  {
    id: 'file002',
    name: 'dashlite-1.2.zip',
    ext: 'zip',
    icon: 'fileZip',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
  },
  {
    id: 'file003',
    name: 'covstats...1.0.zip',
    ext: 'zip',
    icon: 'fileZip',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
    deleted: '02:07 PM, 03 Mar'
  },
  {
    id: 'file004',
    name: 'Price-Update.doc',
    ext: 'doc',
    icon: 'fileDoc',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
  },
  {
    id: 'file005',
    name: 'Quotation.doc',
    ext: 'doc',
    icon: 'fileDoc',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    folder:0,
    deleted: '02:07 PM, 03 Mar'
  },
  {
    id: 'file006',
    name: 'Work-to-do.txt',
    ext: 'txt',
    icon: 'fileText',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    folder:0,
  },
  {
    id: 'file007',
    name: 'DashLite_Crypto_v1.psd',
    ext: 'psd',
    icon: 'fileMedia',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
  },
  {
    id: 'file008',
    name: 'New Movie 2020.mp4',
    ext: 'mp4',
    icon: 'fileMovie',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    folder:0,
  },
  {
    id: 'file009',
    name: 'Project Access.xls',
    ext: 'xls',
    icon: 'fileSheet',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    folder:0,
  },
  {
    id: 'file010',
    name: '2019 Presentation.ppt',
    ext: 'ppt',
    icon: 'filePPT',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
  },
  {
    id: 'file011',
    name: 'app-file-manager.html',
    ext: 'html',
    icon: 'fileCode',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
    deleted: '02:07 PM, 03 Mar'
  },
  {
    id: 'file012',
    name: 'Industrial_Other_PSD.zip',
    ext: 'zip',
    icon: 'fileZip',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
    deleted: '02:07 PM, 03 Mar'
  },
  {
    id: 'file013',
    name: '2_Home_WIP.psd',
    ext: 'psd',
    icon: 'fileMedia',
    time: '02:07 PM',
    date: '03 Mar',
    size: 41.5,
    type: 'file',
    starred: false,
    access:['uid001', 'uid003', 'uid004', 'uid005'],
    folder:0,
    deleted: '02:07 PM, 03 Mar'
  },
]
*/