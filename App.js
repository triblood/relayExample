// your-app-name/src/App.js
import React, {useState, useEffect} from 'react';
import {View, Text, SafeAreaView, Image, FlatList} from 'react-native';
import fetchGraphQL from './src/fetchGraphQL.js';

function App() {
  // We'll load the name of a repository, initially setting it to null
  const [name, setName] = useState(null);
  const [repoList, setRepoList] = useState();
  const [avatar, SetAvatar] = useState(null);

  // When the component mounts we'll fetch a repository name
  useEffect(() => {
    let isMounted = true;
    fetchGraphQL(`
    query {
      repositoryOwner(login: "triblood") {
        id
        login
        avatarUrl
        repositories (last: 10) {
          edges {
            node {
              id
              name
              description
            }
          }
        } 
      }
    }
    `)
      .then(response => {
        // Avoid updating state if the component unmounted before the fetch completes
        if (!isMounted) {
          return;
        }
        const data = response.data;
        setName(data?.repositoryOwner.login);
        setRepoList(data?.repositoryOwner.repositories.edges);
        SetAvatar(data?.repositoryOwner.avatarUrl);
      })
      .catch(error => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, [fetchGraphQL]);

  const Header = ({children}) => {
    return <View style={{height: 250, marginBottom: 50}}>{children}</View>;
  };
  const RepoItem = ({name, description}) => {
    return (
      <View style={{paddingTop: 5, paddingBottom: 5}}>
        <Text style={{fontWeight: 'bold', fontSize: 16}}>{name}</Text>
        <Text style={{fontSize: 12, color: '#777'}}>
          {description === null ? 'Nenhuma' : description}
        </Text>
      </View>
    );
  };
  const Divider = () => {
    return <View style={{width: '100%', height: 1, backgroundColor: '#ccc'}} />;
  };

  const Avatar = ({url}) => {
    return (
      <View
        style={{width: 24, height: 24, overflow: 'hidden', borderRadius: 50}}>
        <Image source={{uri: url}} style={{width: 24, height: 24}} />
      </View>
    );
  };

  // Render "Loading" until the query completes
  return (
    <SafeAreaView style={{flex: 1, marginLeft: 20, marginRight: 20}}>
      <Header>
        <Image
          source={require('./src/img/GitHub-Logo.png')}
          style={{width: '100%', height: 250}}
        />
      </Header>
      <View
        style={{
          width: '100%',
          borderBottomColor: '#ccc',
          borderBottomWidth: 1,
          borderTopColor: '#ccc',
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: 10,
          marginBottom: 20,
        }}>
        <Text>Lista de repositorios de {name}</Text>
        <Avatar url={avatar} />
      </View>
      <FlatList
        data={repoList}
        renderItem={({item}) => (
          <RepoItem name={item.node.name} description={item.node.description} />
        )}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
      />
    </SafeAreaView>
  );
}

export default App;
