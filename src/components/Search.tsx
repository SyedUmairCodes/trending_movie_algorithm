interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const Search = ({ searchTerm, setSearchTerm }: Props) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" />
        <input
          type="text"
          placeholder="Search your favorite movies"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
